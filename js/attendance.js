var selectCategory = undefined;
emptyAlert('message');
$(function (event) {

    fn_resetSearchDetails();

    var categories = ['Labour', 'Dealer', 'Helper', 'Driver', 'Operator', 'Engineer', 'Supervisor'];
    $("#txtSearch").autocomplete({
        source: categories,
        select: function (event, ui) {
            selectCategory = ui.item;
        }
    });

    if (fn_isLocalStorageEmpty(EMP_DET_KEY)) {
        fn_loadEmployees();
    }

    //setMinDate('txtAttDate','2020-11-27');
    setMaxDate('txtAttDate', $.datepicker.formatDate("yy-mm-dd", new Date()));
});

function fn_searchEmployee() {
    emptyAlert('message');
    var hasValidationError = checkIfEmptyAndValidate('txtSearch', 'search_field_error', 'Please select employee category.');
    if (!hasValidationError) {
        if (!selectCategory) {
            hasValidationError = true;
            var field = $('#search_field_error');
            buildError(field, 'Please select valid employee category.', true);
        }
    }
    if (!hasValidationError) {
        showLoader();
        var tbody = '';
        var employees = JSON.parse(fn_getLocalStorage(EMP_DET_KEY));
        for (var index in employees) {
            if (employees[index].type == selectCategory.value) {
                tbody += '<tr>';
                tbody += '<td>';
                tbody += '<input type="checkbox" name="empId" value="' + employees[index].id + '">';
                tbody += '</td>';
                tbody += '<td>';
                tbody += employees[index].first + ' ' + employees[index].last;
                tbody += '</td>';
                tbody += '<td>';
                tbody += employees[index].type;
                tbody += '</td>';
                tbody += '</tr>';
            }
        }
        if (!tbody || tbody.length == 0) {
            tbody += '<tr>';
            tbody += '<td colspan="3" class="text-center">';
            tbody += 'No employee(s) details available';
            tbody += '</td>';
            tbody += '</tr>';
        }
        $('#empDetails').html(tbody);
        fn_toggleDetails(true);
        hideLoader();
    }
}

function fn_checkAll() {
    var isSelectAll = $('#textEmpSelectAll').is(':checked');
    $('input[type=checkbox][name=empId]').prop('checked', isSelectAll);
}

function fn_setEmployeeDetails(employee) {

}

function fn_resetSearchDetails() {
    $('#txtSearch').val('');
    $('#txtAttType').prop('selectedIndex', 0);
    $('#txtAttDate').val('');
    $('#empDetails').html('');

    fn_toggleDetails(false);
}

function fn_toggleDetails(toggle) {
    if (toggle) {
        $('#typeDiv').show();
        $('#attdateDiv').show();
        $('#attButtons').show();
        $('#tbEmpDetails').show();
    } else {
        $('#typeDiv').hide();
        $('#attdateDiv').hide();
        $('#attButtons').hide();
        $('#tbEmpDetails').hide();
    }
}
function fn_markIn() {
    var hasValidationError = false;
    var attendanceRequest = {};
    var employees = [];
    emptyAlert('message');
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
        var date = $('#txtAttDate');
        if (date.val() == undefined || !date.val()) {
            date = $.datepicker.formatDate("yy-mm-dd", new Date());
        }else {
            date = $.datepicker.formatDate("yy-mm-dd", new Date(date.val()));
        }
        attendanceRequest = { employees: employees, type: $('#txtAttType').val(), date: date };
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('EMP_MARK_IN_URI')),
            type: 'POST',
            data: JSON.stringify(attendanceRequest)
        }).done(function (response) {
            hideLoader();
            fn_resetSearchDetails();
            buildAlert('message', response);
        }).fail(function (error) {
            hideLoader();
            buildAlert('message', error);
        });
    }
}

function fn_markOut() {
    emptyAlert('message');
    showLoader();
    $.ajax({
        url: buildUrl(endPointsMap.get('EMP_MARK_OUT_URI')),
        type: 'POST',
        data: JSON.stringify({ employee: selectEmployee.id })
    }).done(function (response) {
        hideLoader();
        $('#empDetails').hide();
        fn_resetSearchDetails();
        buildAlert('message', response);
    }).fail(function (error) {
        hideLoader();
        buildAlert('message', error);
    });
}

function fn_cancel() {
    fn_resetSearchDetails();
    emptyAlert('message');
}
