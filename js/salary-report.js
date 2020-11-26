$(document).ready(function () {
    //$('#salaryTable').DataTable();
    hideDivs();
});

function fn_search() {
    var hasValidationError = checkIfEmptyAndValidate('txtSalaryDate', 'search_field_error', 'Please select salary month.');
    if (!hasValidationError) {
        var attendanceDate = $('#txtSalaryDate').val();
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('SAL_REPORT_URI')),
            type: 'POST',
            data: JSON.stringify({ date: attendanceDate })
        }).done(function (response) {
            hideLoader();
            var tbody = prepareTableBody(response.SAL_INFO, attendanceDate);
            $('#salInfoTbody').html(tbody);
            fn_setHtml('mearnamount', 0);
            fn_setHtml('aearnamount', 0);
            fn_setHtml('mexpamount', response.ME);
            fn_setHtml('aexpamount', response.YE);

            showDivs();

        }).fail(function (error) {
            hideLoader();
            hideDivs();
            buildAlert('message', error);
        });
    }
}

function showDivs() {
    $('#mearnDiv').show();
    $('#aearnDiv').show();
    $('#mexpDiv').show();
    $('#aexpDiv').show();
    $('#empSalDetailsDiv').show();
}

function hideDivs() {
    $('#mearnDiv').hide();
    $('#aearnDiv').hide();
    $('#mexpDiv').hide();
    $('#aexpDiv').hide();
    $('#empSalDetailsDiv').hide();
}

function prepareTableBody(salaries, month) {
    var tbody = '';
    if (salaries.length > 0) {
        $.each(salaries, function (key, value) {
            tbody += '<tr>';
            tbody += '<td>';
            tbody += value.name
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.position
            tbody += '</td>';
            tbody += '<td>';
            if (!value.salaryDate) value.salaryDate = '';
            tbody += value.salaryDate;
            tbody += '</td>';
            tbody += '<td>';
            if (!value.salary) value.salary = 0;
            tbody += value.salary;
            tbody += '</td>';
            tbody += '<td>';
            if (!value.advanceSalary) value.advanceSalary = 0;
            tbody += value.advanceSalary;
            tbody += '</td>';
            tbody += '</tr>';
        });
    } else {
        tbody += '<tr>';
        tbody += '<td  colspan="5" class="text-center">';
        tbody += 'No data available for ' + month;
        tbody += '</td>';
        tbody += '</tr>';
    }

    return tbody;
}