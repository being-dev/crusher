var employeeDataTable = $('#employeesTable').DataTable({
    responsive: true,
    destroy: true,
    processing: true
});


$(function (event) {
    loadEmployees();
    $('#btnSave').show();
    $('#btnUpdate').hide();
    //Remove any CSS class from message div
    emptyAlert('modalMessage');


    var input2 = document.getElementById("txtPhoto");
    input2.onchange = function () {
        document.getElementById('custPic-image').src = '';
        $(".image-sec-cust").append('<i class="fa fa-refresh fa-spin" style="font-size: 81px;color: #2e6da4;"></i>')
        setTimeout(resizeCustPic, 200);
    };

});

function loadEmployees() {
    showLoader();
    //_ajaxCallForEmployees();
    if (fn_isLocalStorageEmpty(EMP_DET_KEY)) {
        fn_loadEmployees();
    } else {
        hideLoader();
    }

    fn_refreshGrid();
}

function fn_refreshGrid() {
    var employees = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
    var table_data = buildTableData(employees);
    employeeDataTable.clear().draw();
    employeeDataTable.rows.add(table_data);
    employeeDataTable.draw();
}

function fn_updateEmployeeLocalItem(item, isRemove) {
    var localItems = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
    var obj = JSON.parse(item);
    var isFound = false;
    var updateDetails = [];
    $.each(localItems, function (key, value) {
        if (isRemove) {
            if (obj.id == value.id) {

            } else {
                updateDetails.push(value);
            }
        } else {
            if (obj.id == value.id) {
                value.first = obj.first;
                value.last = obj.last;
                value.mobileNo = obj.mobileNo;
                value.permanentAddress = obj.permanentAddress;
                value.aadhar = obj.aadhar;
                value.pan = obj.pan;
                value.birthDate = obj.birthDate;
                value.age = obj.age;
                value.salary = obj.salary;
                value.type = obj.type;
            } else {
                updateDetails.push(value);
            }
        }
    });
    if (!isFound && !isRemove) {
        updateDetails.push(JSON.parse(item));
    }
    var table_data = buildTableData(updateDetails);
    employeeDataTable.clear().draw();
    employeeDataTable.rows.add(table_data);
    employeeDataTable.draw();
    fn_removeLocalStorage(EMP_DET_KEY);
    fn_putLocalStorage(EMP_DET_KEY, JSON.stringify(updateDetails));
}

function _ajaxCallForEmployees() {
    $.ajax({
        url: buildUrl(endPointsMap.get('EMP_FIND_ALL_URI')),
        type: 'POST'
    }).done(function (response) {
        var employees = response;
        fn_putLocalStorage(EMP_DET_KEY, JSON.stringify(response));
        var table_data = buildTableData(employees);
        employeeDataTable.rows.add(table_data);
        employeeDataTable.draw();
        hideLoader();
    }).fail(function (error) {
        hideLoader();
        buildAlert('message', error);
    });
}

function buildTableData(response) {
    var table_data = [];
    $.each(response, function (key, value) {
        var removeBtn = '<a href="javascript:void(0);" class="btn btn-danger" title="Remove" data-toggle="modal" data-target="#removeModal" onclick="fn_removeItem(\'' + value.id + '\')"><i class="fas fa-user-minus" aria-hidden="true"></i></a>';
        var updateBtn = '<a href="javascript:void(0);" class="btn btn-primary" title="Modify" onclick="fn_modify(\'' + value.id + '\')"><i class="fas fa-user-edit" aria-hidden="true"></i></a>';
        if (!value.middle) {
            value.middle = '';
        }
        var data = [value.first + ' ' + value.last, value.type, value.residentialAddress, value.mobileNo, value.salary, updateBtn, removeBtn];
        table_data.push(data);
    });
    return table_data;
}

function fn_addEmployee() {
    $('#employeeModalDialog').show();
    $('#btnSave').show();
    $('#btnUpdate').hide();
    emptyAlert('modalMessage');
}

function fn_closeEmployeeDialog() {
    resetErrorFields();
    $('#btnSave').show();
    $('#btnUpdate').hide();
    $('#employeeModalDialog').hide();
    emptyAlert('modalMessage');
    $("#custPic-image").attr('src', '');
}

var removeEmployee = undefined;
function fn_removeItem(id) {
    removeEmployee = id;
}

function fn_remove() {
    showLoader();
    $.ajax({
        url: buildUrl(endPointsMap.get('EMP_REMOVE_URI')),
        type: 'POST',
        dataType: 'text',
        data: JSON.stringify({ id: removeEmployee }),
    }).done(function (response, status, xhr) {
        fn_updateEmployeeLocalItem(JSON.stringify({ id: removeEmployee }), true);
        buildAlert('message', xhr);
    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
        buildAlert('message', XMLHttpRequest);
    }).always(function () {
        $('#removeModal').modal('hide');
        hideLoader();
    });
}

function fn_modify(id) {
    var employees = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
    $.each(employees, function (key, value) {
        if (id == value.id) {
            setFormFields(value);
        }
    });
    $('#employeeModalDialog').show();
    $('#btnSave').hide();
    $('#btnUpdate').show();
    emptyAlert('modalMessage');

    fn_loadDocument(id);
}

function fn_createEmployee() {
    emptyAlert('modalMessage');
    var formData = $('#frmEmployeeDetails').serializeJSON();
    var hasErrors = validateForm();
    if (!hasErrors) {

        var custPic = "";
        if ($("#txtPhoto").val().trim().length > 0 && $("#custPic-image").attr('src') && $("#custPic-image").attr('src').trim().length > 0) {
            custPic = $("#custPic-image").attr('src').split(',')[1];
            formData["custPic"] = custPic;
        } else {
            formData["custPic"] = null;
        }
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('EMP_SAVE_URI')),
            type: "POST",
            dataType: 'text',
            data: JSON.stringify(formData)
        }).done(function (response, status, xhr) {
            hideLoader();
            resetErrorFields();
            fn_updateEmployeeLocalItem(response, false);
            buildAlert('message', { status: 200, responseText: 'Employee details has been saved successfully.' });
            $('#employeeModalDialog').hide();
        }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
            hideLoader();
            buildAlert('modalMessage', XMLHttpRequest);
        });
    }
}

function fn_updateEmployee() {
    emptyAlert('modalMessage');
    var formData = $('#frmEmployeeDetails').serializeJSON();
    var hasErrors = validateForm();
    if (!hasErrors) {
        if ($("#txtPhoto").val().trim().length > 0 && $("#custPic-image").attr('src') && $("#custPic-image").attr('src').trim().length > 0) {
            var custPic = $("#custPic-image").attr('src').split(',')[1];
            formData["custPic"] = custPic;
        } else {
            formData["custPic"] = null;
        }
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('EMP_UPDATE_URI')),
            type: "POST",
            dataType: 'text',
            data: JSON.stringify(formData)
        }).done(function (response, status, xhr) {
            hideLoader();
            buildAlert('message', { status: 200, responseText: 'Employee details has been updated successfully.' });
            $('#employeeModalDialog').hide();
            fn_updateEmployeeLocalItem(response, false);
        }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
            hideLoader();
            buildAlert('modalMessage', XMLHttpRequest);
        });
    }
}

function validateForm() {
    var hasErrors = false;
    hasErrors = checkIfEmptyAndValidate('txtFirst', 'first_field_error', 'Please provide first name.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtMiddle', 'middle_field_error', 'Please provide middle name.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtLast', 'last_field_error', 'Please provide last name.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtMobile', 'mobile_field_error', 'Please provide mobile no.');
    if (!hasErrors) hasErrors = checkMobileNoAndValidate('txtMobile', 'mobile_field_error', 'Please provide valid mobile no.')
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtBirthDate', 'birth_date_field_error', 'Please provide birth date.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtAge', 'age_field_error', 'Please provide employee age.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtType', 'type_field_error', 'Please select employee type.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtAadhar', 'aadhar_field_error', 'Please provide employee Aadhar no.');
    if (!hasErrors) hasErrors = checkAadharNoAndValidate('txtAadhar', 'aadhar_field_error', 'Please provide valid Aadhar no.')
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtPan', 'pan_field_error', 'Please provide employee PAN no.');
    if (!hasErrors) hasErrors = checkPANNoAndValidate('txtPan', 'pan_field_error', 'Please provide valid PAN no.')
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtSalary', 'salary_field_error', 'Please provide employee salary.');
    if (!hasErrors) hasErrors = checkSalaryAndValidate('txtSalary', 'salary_field_error', 'Please provide valid amount.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtResAdd', 'res_add_field_error', 'Please provide employee residential address.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('txtPermAdd', 'perm_add_field_error', 'Please provide employee permanent address.');
    return hasErrors;
}

function resetErrorFields() {
    $('#frmEmployeeDetails').trigger('reset');
    $.each($("[id$='field_error']"), function (key, value) {
        buildError($('#' + value.id), undefined, false);
    });
}

function setFormFields(employee) {
    $('#txtId').val(employee.id);
    $('#txtFirst').val(employee.first);
    if (employee.middle) $('#txtMiddle').val(employee.middle);
    $('#txtLast').val(employee.last);
    $('#txtMobile').val(employee.mobileNo);
    if (employee.birthDate && employee.birthDate.length > 0) {
        var date = new Date(employee.birthDate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
        $("#txtBirthDate").val(date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2));
    }
    $('#txtAge').val(employee.age);
    $('#txtType').val(employee.type);
    $('#txtAadhar').val(employee.aadhar);
    $('#txtPan').val(employee.pan);
    $('#txtSalary').val(employee.salary);
    $('#txtResAdd').val(employee.residentialAddress);
    $('#txtPermAdd').val(employee.permanentAddress);
}

function resizeCustPic() {
    resizeImageToSpecificWidth("custPic", document.getElementById("txtPhoto"));
}
function resizeImageToSpecificWidth(imgPath, myInput) {
    var width = 200;
    if (myInput.files && myInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                if (img.width > width) {
                    var oc = document.createElement('canvas'), octx = oc.getContext('2d');
                    oc.width = img.width;
                    oc.height = img.height;
                    octx.drawImage(img, 0, 0);
                    while (oc.width * 0.5 > width) {
                        oc.width *= 0.5;
                        oc.height *= 0.5;
                        octx.drawImage(oc, 0, 0, oc.width, oc.height);
                    }
                    oc.width = width;
                    oc.height = oc.width * img.height / img.width;
                    octx.drawImage(img, 0, 0, oc.width, oc.height);
                    $(".fa-refresh").remove();
                    document.getElementById(imgPath + "-image").src = oc.toDataURL();
                }
            };
            document.getElementById(imgPath + "-orignal").src = event.target.result;
            img.src = event.target.result;
        };
        reader.readAsDataURL(myInput.files[0]);
    }
}