
var endPointsMap = new Map();
endPointsMap.set('AUTH_URI', '/login');
endPointsMap.set('EMP_FIND_ALL_URI', '/api/v1/employee/list?action=FIND_ALL');
endPointsMap.set('EMP_REMOVE_URI', '/api/v1/employee/remove?action=DELETE');
endPointsMap.set('EMP_SAVE_URI', '/api/v1/employee/save?action=CREATE');
endPointsMap.set('EMP_UPDATE_URI', '/api/v1/employee/save?action=UPDATE');
endPointsMap.set('GET_EMP_NAMES_URI', '/api/v1/employee/listnames?action=FINDNAMES');
endPointsMap.set('FIND_EMP_URI', '/api/v1/employee/find?action=FIND');
endPointsMap.set('EMP_MARK_IN_URI', '/api/v1/employee/attendance/mark-in?action=MARKIN');
endPointsMap.set('EMP_MARK_OUT_URI', '/api/v1/employee/attendance/mark-out?action=MARKOUT');
endPointsMap.set('ADV_SAL_URI', '/api/v1/employee/salary/adv-salary?action=ADVSALARY');
endPointsMap.set('FULL_SAL_URI', '/api/v1/employee/salary/make-salary?action=MAKEPAYMENT');
endPointsMap.set('ATT_REPORT_URI', '/api/v1/employee/attendance/list?action=ATTREPORT');
endPointsMap.set('SAL_REPORT_URI', '/api/v1/employee/salary/list?action=SALREPORT');

$(function () {
    var url = window.location.pathname;
    if (url && (url != '/' && url.indexOf('index') == -1)) {
        authoriseUser();
    }
});

var accessToken = undefined;

function getToken() {
    return window.localStorage.getItem('access_token');
}

function setToken(token) {
    window.localStorage.setItem('access_token', token);
    accessToken = token;
}

function emptyAlert(elem) {
    $('#' + elem).removeClass();
    $('#' + elem).html('');
}

function handleAlert(response) {
    var alertBox = { code: response.status, message: response.responseText };
    alertBox.visible = false;
    alertBox.class = 'alert';
    if (response.status == 500) {
        alertBox.class = 'alert-danger';
        alertBox.severity = 'error';
    } else if (response.status == 200) {
        alertBox.severity = '';
        alertBox.class = 'alert-success';
    }
    return alertBox;
}

function buildAlert(elem, response) {
    var alertBox = handleAlert(response);
    $('#' + elem).addClass('alert').addClass(alertBox.class);
    $('#' + elem).html('<span>' + alertBox.message + '</span>');
}

function emptyAlert(elem) {
    $('#' + elem).removeClass();
    $('#' + elem).html('');
}

function showLoader() {
    $('#loading').show();
}

function hideLoader() {
    $('#loading').hide();
}

function buildUrl(endPoint) {
    var HTTP_PROTOCOL = "https://";
    var SERVER = "86cfs32wy9";
    var API = "execute-api";
    var REGION = "ap-southeast-1";
    var STAGE = "dev";
    var VENDOR = "amazonaws.com";
    var endPointUrl = HTTP_PROTOCOL;
    endPointUrl = endPointUrl.concat(SERVER).concat('.').concat(API).concat('.').concat(REGION).concat('.').concat(VENDOR);
    endPointUrl = endPointUrl.concat('/').concat(STAGE).concat(endPoint);
    return endPointUrl;
}

function checkIfEmptyAndValidate(fieldName, fieldErrorElem, errorMessage) {
    var hasValidationError = false;
    var field = $('#' + fieldName);
    if (field.attr('required')) {
        var errorField = $('#' + fieldErrorElem);
        if (field && (field.val() == '')) {
            hasValidationError = true;
        }
        buildError(errorField, errorMessage, hasValidationError);
    }
    return hasValidationError;
}

function checkMobileNoAndValidate(fieldName, fieldErrorElem, errorMessage) {
    var regEx = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
    return checkAndValidate(regEx, fieldName, fieldErrorElem, errorMessage);
}

function checkAadharNoAndValidate(fieldName, fieldErrorElem, errorMessage) {
    var regEx = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    return checkAndValidate(regEx, fieldName, fieldErrorElem, errorMessage);
}

function checkPANNoAndValidate(fieldName, fieldErrorElem, errorMessage) {
    var regEx = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return checkAndValidate(regEx, fieldName, fieldErrorElem, errorMessage);
}

function checkSalaryAndValidate(fieldName, fieldErrorElem, errorMessage) {
    var regEx = /^(\d{1,3})*(\d{1,3})?(\.\d{2})?$/;
    return checkAndValidate(regEx, fieldName, fieldErrorElem, errorMessage);
}

function checkAndValidate(regEx, fieldName, fieldErrorElem, errorMessage) {
    var hasValidationError = false;
    var field = $('#' + fieldName);
    var errorField = $('#' + fieldErrorElem);
    if (field.attr('required') && field.val().trim().length > 0) {
        hasValidationError = !regEx.test(field.val());
    }
    buildError(errorField, errorMessage, hasValidationError);
    return hasValidationError;
}

function buildError(errorField, errorMessage, toggle) {
    if (toggle) {
        errorField.addClass('error');
        errorField.html(errorMessage);
    } else {
        errorField.removeClass('error');
        errorField.html('');
    }
}

function _ajaxRequest(ajaxUrl, ajaxMethod, ajaxRequestData) {
    return $.ajax({ url: ajaxUrl, type: ajaxMethod, data: ajaxRequestData });
}

function authoriseUser() {
    if (!window.localStorage.getItem('access_token')) {
        window.location.replace('index.html');
    } else {
        //window.location.href = 'blank.html';
    }
}

function fn_logout() {
    if (getToken()) {
        window.localStorage.removeItem('access_token');
        window.location.replace('index.html');
    }
}

function fn_setHtml(elem, html) {
    $('#' + elem).html(html);
}

function fn_setVal(elem, val) {
    $('#' + elem).val(val);
}