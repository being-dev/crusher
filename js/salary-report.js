
var salaryTable = $('#salaryTable').DataTable({
    responsive: true,
    destroy: true,
    processing: true
});

$(document).ready(function () {
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
            var table_data = buildTableData(response.EMP_SAL_INFO);
            salaryTable.clear().draw();
            salaryTable.rows.add(table_data);
            salaryTable.draw();           
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
    $('#downloadDiv').show();
}

function hideDivs() {
    $('#totalamountDiv').hide();
    $('#advamountnDiv').hide();
    $('#netexpamountDiv').hide();
    $('#empSalDetailsDiv').hide();
    $('#downloadDiv').hide();
}

function buildTableData(salaries) {
    var table_data = [];
    $.each(salaries, function (key, value) {
        var name = value.name + '(' + value.position + ')';
        var data = [name, value.currentSalary, value.dailyWages, value.presentDays, value.salary, value.advanceSalary, value.netSalary];
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
            tbody += value.name + '(' + value.position + ')';
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

function fn_downloadPDF() {
    var doc = new jsPDF('p', 'pt', 'a4');
    var month = $('#txtSalaryDate').val();
    var formattedDate = $.datepicker.formatDate('MM yy', new Date(month));
    var pageHeight = 0;
    pageHeight = doc.internal.pageSize.height;
    specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector  
        '#bypassme': function (element, renderer) {
            // true = "handled elsewhere, bypass text extraction"  
            return true
        }
    };
    margins = {
        top: 150,
        bottom: 60,
        left: 40,
        right: 40,
        width: 800
    };
    var y = 20;
    doc.setLineWidth(2);
    doc.setFontSize(10);
    doc.text(200, y = y + 30, "SALARY REPORT - "+formattedDate);
    doc.autoTable({
        html: '#salaryTable',
        startY: 70,
        theme: 'striped',
        columnStyles: {
            0: {
                cellWidth: 110,
            },
            1: {
                cellWidth: 50,
            },
            2: {
                cellWidth: 50,
            },
            3: {
                cellWidth: 50,
            },
            4: {
                cellWidth: 100,
            },
            5: {
                cellWidth: 70,
            },
            6: {
                cellWidth: 70,
            }
        },
        styles: {
            minCellHeight: 30
        }
    })
    doc.save('SalaryReport.pdf');
}