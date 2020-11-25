$(function () {
    $('#teDiv').hide();
    $('#tpeDiv').hide();
    $('#taeDiv').hide();
    $('#empDetailsDiv').hide();
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
            //var response = '{"TA_CNT":3,"EMP_INFO":[{"employee":"8b62bd6d-f45c-4be8-8a14-6e09697ca20e","name":"Vikrant Thakur","position":"Labour","present":true},{"employee":"86e41e30-b226-4b1f-814b-992ff1baa473","name":"Jagruti Mhatre","position":"Supervisor","present":false},{"employee":"b16b63cc-949e-495c-9bb4-99e71e7eb935","name":"Pranit Mhatre","position":"Engineer","present":true},{"employee":"73de1837-849d-43ca-90fc-6586944472a8","name":"Shan Patil","position":"Labour","present":false},{"employee":"2bf7cd43-cd3b-4138-887f-f2d24da3fcba","name":"xsfsd jjdjfkdf","position":"Supervisor","present":false}],"TOTAL_CNT":5,"TP_CNT":2}';
            //var json = JSON.parse(response);
            //console.log(json.EMP_INFO)
            var tbody = prepareTableBody(response.EMP_INFO, attendanceDate);
            $('#te').html(response.TOTAL_CNT);
            $('#tpe').html(response.TP_CNT);
            $('#tae').html(response.TA_CNT);
            $('#attTbody').html(tbody);
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
                tbody += '<a href="javascript:void(0);" title="Present" alt="Present" class="btn btn-primary btn-circle"><i class="fab fa-check"></i></a>';
            } else {
                tbody += '<a href="javascript:void(0);" title="Absent" alt="Absent" class="btn btn-danger btn-circle"><i class="fab fa-times"></i></a>';
            }
            tbody += '</td>';
            tbody += '</tr>';
        });
    } else {
        tbody += '<tr>';
        tbody += '<td  colspan="4">';
        tbody += 'No data available for '+attendanceDate;
        tbody += '</td>';
        tbody += '</tr>';
    }

    return tbody;
}