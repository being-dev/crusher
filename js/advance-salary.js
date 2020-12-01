var selectCategory = undefined;
emptyAlert('message');
$(function (event) {

    if (fn_isLocalStorageEmpty(EMP_DET_KEY)) {
        fn_loadEmployees();
    }

    var categories = ['Labour', 'Dealer', 'Helper', 'Driver', 'Operator', 'Engineer', 'Supervisor'];
    $("#txtSearch").autocomplete({
        source: categories,
        select: function (event, ui) {
            selectCategory = ui.item;
            fn_toggleDetails(false);
            $('input[type=checkbox][name=txtCheckAll]').prop('checked', false);
            $('input[type=checkbox][name=empSelectAll]').prop('checked', false);
            $('#empDetails').html('');
            fn_toggleDetails(false);
        }
    });

    fn_toggleDetails(false);
});

function fn_searchEmployee() {
    emptyAlert('message');
    var salDate = undefined;
    var hasValidationError = checkIfEmptyAndValidate('txtSearch', 'search_field_error', 'Please select employee category.');
    if (!selectCategory) {
        hasValidationError = true;
        var field = $('#search_field_error');
        buildError(field, 'Please select valid employee category.', true);
    }
    else if (!hasValidationError) {
        if ($('#salAmountDiv').is(":visible")) {
            hasValidationError = checkIfEmptyAndValidate('txtSalWeek', 'week_field_error', 'Please select salary week.');
            if (!hasValidationError) {
                salDate = $('#txtSalWeek').val();
            }
        }
    }
    if (!hasValidationError) {
        //showLoader();
        var employees = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
        var tbody = '';
        for (var index in employees) {
            if (employees[index].type == selectCategory.value) {
                tbody += '<tr>';
                tbody += '<td>';
                tbody += '<input type="checkbox" id="empId_' + employees[index].id + '" name="empId" value="' + employees[index].id + '">';
                tbody += '</td>';
                tbody += '<td>';
                tbody += employees[index].first + ' ' + employees[index].last;
                tbody += '</td>';
                tbody += '<td>';
                tbody += employees[index].salary;
                tbody += '</td>';
                tbody += '<td>';
                tbody += '<input type="number" id="txtEmpAdvAmt_' + employees[index].id + '" class="form-control" required>';
                tbody += '</td>';
                tbody += '</tr>';
            }
        }
        if (!tbody || tbody.length == 0) {
            tbody += '<tr>';
            tbody += '<td colspan="4" class="text-center">';
            tbody += 'No employee(s) details available';
            tbody += '</td>';
            tbody += '</tr>';
        }
        $('#empDetails').html(tbody);
        fn_toggleDetails(true);
    }
}

function blankEmployeeDetails() {
    $('#txtSearch').val('');
    $('#txtAmount').val('');
    $('#empDetails').html('');

    buildError($('#amount_field_error'), undefined, false);
}

function fn_toggleDetails(toggle) {
    if (toggle) {
        $('#salAmountDiv').show();
        $('#amountCheckDiv').show();
        $('#salButtons').show();
        $('#tbEmpDetails').show();
        $('input[type=checkbox][name=txtCheckAll]').prop('checked', false);
        $('input[type=checkbox][name=empSelectAll]').prop('checked', false);
    } else {
        $('#salAmountDiv').hide();
        $('#amountCheckDiv').hide();
        $('#salButtons').hide();
        $('#tbEmpDetails').hide();
    }
}

function fn_checkAll() {
    var isSelectAll = $('#textEmpSelectAll').is(':checked');
    $('input[type=checkbox][name=empId]').prop('checked', isSelectAll);
}

function fn_process() {
    var hasValidationError = false;
    emptyAlert('message');

    if (!hasValidationError) {
        if ($('#salAmountDiv').is(":visible")) {
            hasValidationError = checkIfEmptyAndValidate('txtAmount', 'amount_field_error', 'Please enter advance salary amount.');
            if (!hasValidationError) {
                hasValidationError = checkAmountAndValidate('txtAmount', 'amount_field_error', 'Please enter valid amount.');
            }
            if (!hasValidationError) {
                var employeesMap = new Map();
                var employees = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
                buildError($('#tbadv_error_field'), undefined, false);
                $.each(employees, function (key, value) {
                    var empId = value.id;
                    if (!hasValidationError && $('#empId_' + empId).is(':checked')) {
                        var advAmount = $('#txtEmpAdvAmt_' + empId).val();
                        hasValidationError = checkIfEmptyAndValidate('txtEmpAdvAmt_' + empId, 'tbadv_error_field', 'Please enter advance amount for ' + (value.first + ' ' + value.last));
                        if (!hasValidationError) { hasValidationError = checkAmountAndValidate('txtEmpAdvAmt_' + empId, 'tbadv_error_field', 'Please enter valid advance amount for ' + (value.first + ' ' + value.last)); }
                        if (!hasValidationError) {
                            employeesMap.set(empId, advAmount);
                        }
                        //}
                    }
                });

                if (!hasValidationError && employeesMap.size == 0) {
                    hasValidationError = true;
                    buildAlert('message', { responseText: 'Please select employee', status: 500 });
                }
            }
        }
    }

    if (!hasValidationError) {
        var jsonObject = {};
        requestUrl = endPointsMap.get('ADV_SAL_URI');
        jsonObject = { salaryMap: mapToObj(employeesMap) };
        console.log(jsonObject);
        showLoader();
        $.ajax({
            url: buildUrl(requestUrl),
            type: 'POST',
            data: JSON.stringify(jsonObject)
        }).done(function (response) {
            hideLoader();
            buildAlert('message', response);
            $('#tbEmpDetails').hide();
            blankEmployeeDetails();
        }).fail(function (error) {
            hideLoader();
            buildAlert('message', error);
        });
    }
}

function fn_updateAmount() {
    var advAmount = $('#txtAmount').val();
    if ($('#txtCheckAll').is(':checked')) {
        $.each($("input[id^='txtEmpAdvAmt_']"), function () {
            $(this).val(advAmount);
            $(this).attr('readonly', true);
        });
    } else {
        $.each($("input[id^='txtEmpAdvAmt_']"), function () {
            $(this).val('');
            $(this).attr('readonly', false);
        });
    }
}

function fn_cancel() {
    var field = $('#type_field_error');
    buildError(field, undefined, false);
    fn_toggleDetails(false);
    blankEmployeeDetails();
    emptyAlert('message');
    $('input[type=checkbox][name=txtCheckAll]').prop('checked', false);
    $('input[type=checkbox][name=empSelectAll]').prop('checked', false);
}

