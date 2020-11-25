function fn_login() {
    var formData = $('#frmLogin').serializeJSON();
    $('#message').removeClass();
    var hasErrors = checkIfEmptyAndValidate('userId', 'username_field_error', 'Please provide username.');
    if (!hasErrors) hasErrors = checkIfEmptyAndValidate('passwordId', 'password_field_error', 'Please provide password.');

    if (!hasErrors) {
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('AUTH_URI')),
            type: "POST",
            data: JSON.stringify(formData)
        }).done(function (response) {
            hideLoader();
            window.localStorage.setItem('access_token', response);
            window.location.href = 'blank.html';
        }).fail(function (error) {
            hideLoader();
            alert = handleAlert(error);
            $('#message').addClass('alert').addClass(alert.class);
            $('#message').html('<span>' + alert.message + '</span>');
        });
    }
}