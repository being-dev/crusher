var selectCategory = undefined;
emptyAlert('message');
$(function (event) {

    setMaxDate('txtSalMonth', $.datepicker.formatDate("yy-mm", new Date()));

    if (fn_isLocalStorageEmpty(EMP_DET_KEY)) {
        fn_loadEmployees();
    }

    var categories = ['Labour', 'Dealer', 'Helper', 'Driver', 'Operator', 'Engineer', 'Supervisor'];
    $("#txtSearch").autocomplete({
        source: categories,
        select: function (event, ui) {
            selectCategory = ui.item;
            fn_toggleDetails(false);
            $('input[type=checkbox][name=empSelectAll]').prop('checked', false);
            $('#empDetails').html('');
            if (selectCategory.value == 'Labour' || selectCategory.value == 'Dealer' || selectCategory.value == 'Helper') {
                $('#salWeekDiv').show();
                $('#salMonthDiv').hide();
                $('#txtSalMonth').val('');
            } else {
                $('#salWeekDiv').hide();
                $('#salMonthDiv').show();
                $('#txtSalWeek').val('');
            }
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
        if ($('#salWeekDiv').is(":visible")) {
            hasValidationError = checkIfEmptyAndValidate('txtSalWeek', 'week_field_error', 'Please select salary week.');
            if (!hasValidationError) {
                salDate = $('#txtSalWeek').val();
            }
        }
        else if ($('#salMonthDiv').is(":visible")) {
            hasValidationError = checkIfEmptyAndValidate('txtSalMonth', 'month_field_error', 'Please select salary month.');
            if (!hasValidationError) {
                salDate = $('#txtSalMonth').val();
            }
        }
    }
    if (!hasValidationError) {
        showLoader();
        var employees = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
        var empMap = new Map();
        for (var index in employees) {
            if (employees[index].type == selectCategory.value) {
                empMap.set(employees[index].id, employees[index].salary);
            }
        }
        var jsonObject = { date: salDate, type: selectCategory.value, salaryMap: mapToObj(empMap) };
        var salDetails = undefined;
        $.ajax({
            url: buildUrl(endPointsMap.get('SAL_DETAILS_URI')),
            async: false,
            type: 'POST',
            data: JSON.stringify(jsonObject)
        }).done(function (response) {
            hideLoader();
            salDetails = response;
        }).fail(function (error) {
            hideLoader();
            buildAlert('message', error);
        });
        var tbody = '';
        for (var index in employees) {
            if (employees[index].type == selectCategory.value) {
                var advSal = 0.0;
                var presentDay = 0;
                var dailyWages = 0.0;
                var netSal = 0.0;
                $.each(salDetails, function (key, value) {
                    if (employees[index].id == key) {
                        advSal = value.ADV_SAL;
                        presentDay = value.PR_DAY;
                        dailyWages = value.DAY_SAL;
                        netSal = value.NET_SAL;
                    }
                });
                tbody += '<tr>';
                tbody += '<td>';
                tbody += '<input type="checkbox" name="empId" value="' + employees[index].id + '">';
                tbody += '</td>';
                tbody += '<td>';
                tbody += employees[index].first + ' ' + employees[index].last;
                tbody += '</td>';
                tbody += '<td>';
                tbody += employees[index].salary;
                tbody += '</td>';
                tbody += '<td>';
                tbody += dailyWages;
                tbody += '</td>';
                tbody += '<td>';
                tbody += presentDay;
                tbody += '</td>';
                tbody += '<td>';
                tbody += advSal;
                tbody += '</td>';
                tbody += '<td>';
                tbody += netSal;
                tbody += '</td>';
                tbody += '</tr>';
            }
        }
        if (!tbody || tbody.length == 0) {
            tbody += '<tr>';
            tbody += '<td colspan="6" class="text-center">';
            tbody += 'No employee(s) details available';
            tbody += '</td>';
            tbody += '</tr>';
        }
        $('#empDetails').html(tbody);
        fn_toggleDetails(true);
        hideLoader();
    }
}

function setEmployeeDetails(employee) {

}

function blankEmployeeDetails() {
    $('#txtSearch').val('');
    $('#txtSalMonth').val('');
    $('#txtSalWeek').val('');
    $('#empDetails').html('');

    buildError($('#week_field_error'), undefined, false);
    buildError($('#month_field_error'), undefined, false);
}

function fn_toggleDetails(toggle) {
    if (toggle) {
        $('#salButtons').show();
        $('#tbEmpDetails').show();
    } else {
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
    var employees = [];
    emptyAlert('message');

    if (!hasValidationError) {
        if ($('#salWeekDiv').is(":visible")) {
            hasValidationError = checkIfEmptyAndValidate('txtSalWeek', 'week_field_error', 'Please select salary week.');
            if (!hasValidationError) {
                salDate = $('#txtSalWeek').val();
            }
        }
        else if ($('#salMonthDiv').is(":visible")) {
            hasValidationError = checkIfEmptyAndValidate('txtSalMonth', 'month_field_error', 'Please select salary month.');
            if (!hasValidationError) {
                salDate = $('#txtSalMonth').val();
            }
        }
    }

    $.each($("input[name='empId']"), function () {
        if ($(this).is(':checked')) {
            employees.push(($(this).val()));
        }
    });
    if (employees.length == 0) {
        hasValidationError = true;
        buildAlert('message', { responseText: 'Please select employee', status: 500 });
    }

    if (!hasValidationError) {
        var jsonObject = {};
        requestUrl = endPointsMap.get('FULL_SAL_URI');
        jsonObject = { employees: employees, date: salDate };
        if (!hasValidationError) {
            emptyAlert('message');
            showLoader();
            $.ajax({
                url: buildUrl(requestUrl),
                type: 'POST',
                data: JSON.stringify(jsonObject)
            }).done(function (response) {
                hideLoader();
                buildAlert('message', response);
                $('#empDetails').hide();
                blankEmployeeDetails();
            }).fail(function (error) {
                hideLoader();
                buildAlert('message', error);
            });
        }

    }
}

function fn_cancel() {
    var field = $('#type_field_error');
    buildError(field, undefined, false);
    fn_toggleDetails(false);
    blankEmployeeDetails();
    $('#salWeekDiv').hide();
    $('#salMonthDiv').hide();
    emptyAlert('message');
}

