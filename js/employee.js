var employees = [];
var employeeDataTable = $('#employeesTable').DataTable({
    responsive: true,
    destroy: true,
    processing: true,
});
function loadEmployees() {
    showLoader();
    _ajaxCallForEmployees();
}

function _ajaxCallForEmployees() {
    var alertBox = {};
    $.ajax({
        url: buildUrl(endPointsMap.get('EMP_FIND_ALL_URI')),
        type: 'POST'
    }).done(function (response) {
        employees = response;
        var table_data = buildTableData(employees);
        employeeDataTable.rows.add(table_data);
        employeeDataTable.draw();
        hideLoader();
    }).fail(function (error) {
        hideLoader();
        alertBox = handleAlert(error);
        $('#message').addClass('alert').addClass(alertBox.class);
        $('#message').html('<span>' + alertBox.message + '</span>');
    });
}

function buildTableData(response) {
    var table_data = [];
    $.each(response, function (key, value) {
        //var removeBtn = '<buttton type="button" title="Remove" onclick="fn_remove(\'' + value.id + '\')"><i class="fas fa-trash-alt" aria-hidden="true"></i></button>';
        var updateBtn = '<buttton type="button" title="Modify" onclick="fn_modify(\'' + value.id + '\')"><i class="fas fa-user-edit" aria-hidden="true"></i></button>';
        if (!value.middle) {
            value.middle = '';
        }
        var data = [value.first + ' ' + value.middle + ' ' + value.last, value.type, value.permanentAddress, value.age, value.mobileNo, value.salary, updateBtn];
        table_data.push(data);
    });
    return table_data;
}

$(function (event) {
    loadEmployees();
    $('#btnSave').show();
    $('#btnUpdate').hide();
    //Remove any CSS class from message div
    $('#modalMessage').removeClass();
});

function fn_addEmployee() {
    $('#employeeModalDialog').show();
    $('#btnSave').show();
    $('#btnUpdate').hide();
    $('#modalMessage').removeClass();
    $('#modalMessage').html('');
}

function fn_closeEmployeeDialog() {
    resetErrorFields();
    $('#btnSave').show();
    $('#btnUpdate').hide();
    $('#employeeModalDialog').hide();
    $('#modalMessage').removeClass();
    $('#modalMessage').html('');
    window.location.reload();
}

function fn_remove(id) {
    var alertBox = {};
    showLoader();
    $.ajax({
        url: buildUrl(endPointsMap.get('EMP_REMOVE_URI')),
        type: 'POST',
        data: { id: id }
    }).done(function (response) {
    }).fail(function (error) {
        hideLoader();
        alertBox = handleAlert(error);
        $('#message').addClass('alert').addClass(alertBox.class);
        $('#message').html('<span>' + alertBox.message + '</span>');
    });;
}

function fn_modify(id) {
    $.each(employees, function (key, value) {
        if (id == value.id) {
            setFormFields(value);
        }
    });
    $('#employeeModalDialog').show();
    $('#btnSave').hide();
    $('#btnUpdate').show();
    $('#modalMessage').removeClass();
    $('#modalMessage').html('');
}

function fn_createEmployee() {
    var formData = $('#frmEmployeeDetails').serializeJSON();
    var alertBox = {};
    var hasErrors = validateForm();
    if (!hasErrors) {
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('EMP_SAVE_URI')),
            type: "POST",
            data: JSON.stringify(formData)
        }).done(function (response) {
            hideLoader();
            resetErrorFields();
            alertBox = handleAlert(response);
            $('#modalMessage').addClass('alert').addClass(alertBox.class);
            $('#modalMessage').html('<span>' + alertBox.message + '</span>');
        }).fail(function (error) {
            hideLoader();
            alertBox = handleAlert(error);
            $('#modalMessage').addClass('alert').addClass(alertBox.class);
            $('#modalMessage').html('<span>' + alertBox.message + '</span>');
        });
    }
}

function fn_updateEmployee() {
    var formData = $('#frmEmployeeDetails').serializeJSON();
    var alertBox = {};
    var hasErrors = validateForm();
    if (!hasErrors) {
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('EMP_UPDATE_URI')),
            type: "POST",
            data: JSON.stringify(formData)
        }).done(function (response) {
            hideLoader();
            alertBox = handleAlert(response);
            $('#modalMessage').addClass('alert').addClass(alertBox.class);
            $('#modalMessage').html('<span>' + alertBox.message + '</span>');

            //_ajaxCallForEmployees();

            //$('#employeesTable').dataTable().fnClearTable();
            //$('#employeesTable').dataTable().fnAddData(null);

        }).fail(function (error) {
            hideLoader();
            alertBox = handleAlert(error);
            $('#modalMessage').addClass('alert').addClass(alertBox.class);
            $('#modalMessage').html('<span>' + alertBox.message + '</span>');
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