var attendanceTable = $('#attendanceTable').DataTable({
    responsive: true,
    destroy: true,
    processing: true
});

$(function () {
    $('#teDiv').hide();
    $('#tpeDiv').hide();
    $('#taeDiv').hide();
    $('#empDetailsDiv').hide();

    setMaxDate('txtSearchDate', $.datepicker.formatDate("yy-mm-dd", new Date()));
});

function fn_searchEmployee() {
    var hasValidationError = checkIfEmptyAndValidate('txtSearchDate', 'search_field_error', 'Please provide attendance date.');
    if (!hasValidationError) {
        var attendanceDate = $('#txtSearchDate').val();
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('ATT_REPORT_URI')),
            type: 'POST',
            data: JSON.stringify({ date: attendanceDate })
        }).done(function (response) {
            hideLoader();
            var table_data = buildTableData(response.EMP_INFO, attendanceDate);
            attendanceTable.clear().draw();
            attendanceTable.rows.add(table_data);
            attendanceTable.draw();
            $('#te').html(response.TOTAL_CNT);
            $('#tpe').html(response.TP_CNT);
            $('#tae').html(response.TA_CNT);            
            $('#teDiv').show();
            $('#tpeDiv').show();
            $('#taeDiv').show();
            $('#empDetailsDiv').show();
        }).fail(function (error) {
            hideLoader();
            $('#teDiv').hide();
            $('#tpeDiv').hide();
            $('#taeDiv').hide();
            $('#empDetailsDiv').hide();
            buildAlert('message', error);
        });
    }
}

function buildTableData(employees, attendanceDate) {
    var table_data = [];
    $.each(employees, function (key, value) {
        var status = undefined;
        if (value.present) {
            status = '<a href="javascript:void(0);" title="Present" alt="Present" class="btn btn-primary btn-circle"><i class="fas fa-check-circle"></i></a>';
        } else {
            status = '<a href="javascript:void(0);" title="Absent" alt="Absent" class="btn btn-danger btn-circle"><i class="fas fa-times-circle"></i></a>';
        }
        var data = [value.name, value.position, attendanceDate, status];
        table_data.push(data);
    });
    return table_data;
}

function prepareTableBody(employees, attendanceDate) {
    var tbody = '';
    if (employees.length > 0) {
        $.each(employees, function (key, value) {
            tbody += '<tr>';
            tbody += '<td>';
            tbody += value.name
            tbody += '</td>';
            tbody += '<td>';
            tbody += value.position
            tbody += '</td>';
            tbody += '<td>';
            tbody += attendanceDate
            tbody += '</td>';
            tbody += '<td>';
            if (value.present) {
                tbody += '<a href="javascript:void(0);" title="Present" alt="Present" class="btn btn-primary btn-circle"><i class="fas fa-check-circle"></i></a>';
            } else {
                tbody += '<a href="javascript:void(0);" title="Absent" alt="Absent" class="btn btn-danger btn-circle"><i class="fas fa-times-circle"></i></a>';
            }
            tbody += '</td>';
            tbody += '</tr>';
        });
    } else {
        tbody += '<tr>';
        tbody += '<td  colspan="4" class="text-center">';
        tbody += 'No data available for ' + attendanceDate;
        tbody += '</td>';
        tbody += '</tr>';
    }

    return tbody;
}