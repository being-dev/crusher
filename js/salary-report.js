
var salaryTable = $('#salaryTable').DataTable({
    responsive: true,
    destroy: true,
    processing: true
});

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
            console.log(response);
            hideLoader();
            var table_data = buildTableData(response.EMP_SAL_INFO);
            salaryTable.clear().draw();
            salaryTable.rows.add(table_data);
            salaryTable.draw();
            //var tbody = prepareTableBody(response.EMP_SAL_INFO, attendanceDate);
            //$('#salInfoTbody').html(tbody);
            fn_setHtml('totalamount', response.PRE_DAY_SAL_EXPENSE);
            fn_setHtml('advamount', response.ADV_SAL_EXPENSE);
            fn_setHtml('netexpamount', response.NET_SAL_EXPENSE);

            showDivs();

        }).fail(function (error) {
            hideLoader();
            hideDivs();
            buildAlert('message', error);
        });
    }
}

function showDivs() {
    $('#totalamountDiv').show();
    $('#advamountnDiv').show();
    $('#netexpamountDiv').show();
    $('#empSalDetailsDiv').show();
}

function hideDivs() {
    $('#totalamountDiv').hide();
    $('#advamountnDiv').hide();
    $('#netexpamountDiv').hide();
    $('#empSalDetailsDiv').hide();
}

function buildTableData(salaries) {
    var table_data = [];
    $.each(salaries, function (key, value) {
        var data = [value.name, value.position, value.currentSalary, value.dailyWages, value.presentDays, value.salary, value.advanceSalary, value.netSalary];
        table_data.push(data);
    });
    return table_data;
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
            tbody += value.currentSalary;
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.dailyWages;
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.presentDays;
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.salary;
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.advanceSalary;
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.netSalary;
            tbody += '</td>';
            tbody += '</tr>';
        });
    } else {
        tbody += '<tr>';
        tbody += '<td  colspan="7" class="text-center">';
        tbody += 'No data available for ' + month;
        tbody += '</td>';
        tbody += '</tr>';
    }

    return tbody;
}