var selectEmployee = undefined;
emptyAlert('message');
$(function (event) {
    showLoader();
    $.ajax({
        url: buildUrl(endPointsMap.get('GET_EMP_NAMES_URI')),
        type: 'POST'
    }).done(function (response) {
        hideLoader();
        var employees = [];
        $.each(response, function (k, v) {
            var employee = { id: v.id, value: v.first + ' ' + v.middle + ' ' + v.last, category: v.type };
            employees.push(employee);
            $("#txtSearch").catcomplete({
                source: employees,
                select: function (event, ui) {
                    selectEmployee = ui.item;
                }
            });
        });
    }).fail(function (error) {
        hideLoader();
        buildAlert('message', response);
    });;

    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
                currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category font-weight-bold'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        }
    });
});

function fn_searchEmployee() {
    emptyAlert('message');
    var hasValidationError = checkIfEmptyAndValidate('txtSearch', 'search_field_error', 'Please provide employee name.');
    if (!selectEmployee) {
        hasValidationError = true;
        var field = $('#search_field_error');
        buildError(field, 'Please select valid employee name.', true);
    }
    if (!hasValidationError) {
        showLoader();
        $.ajax({
            url: buildUrl(endPointsMap.get('FIND_EMP_URI')),
            type: 'POST',
            data: JSON.stringify({ id: selectEmployee.id })
        }).done(function (response) {
            hideLoader();
            setEmployeeDetails(response);
            $('#empDetails').show();
        }).fail(function (error) {
            hideLoader();
            $('#empDetails').hide();
            buildAlert('message', error);
        });
    }
}

function setEmployeeDetails(employee) {
    $('#txtId').val(employee.id);
    $('#txtFirst').html(employee.first);
    $('#txtMiddle').html(employee.middle);
    $('#txtLast').html(employee.last);
    $('#txtMobile').html(employee.mobileNo);
    $("#txtBirthDate").html(employee.birthDate);
    $('#txtAge').html(employee.age);
    $('#txtType').html(employee.type);
}

function blankEmployeeDetails() {
    $('#txtId').val('');
    $('#txtFirst').html('');
    $('#txtMiddle').html('');
    $('#txtLast').html('');
    $('#txtMobile').html('');
    $("#txtBirthDate").html('');
    $('#txtAge').html('');
    $('#txtType').html('');
}

function fn_markIn() {
    emptyAlert('message');
    showLoader();
    $.ajax({
        url: buildUrl(endPointsMap.get('EMP_MARK_IN_URI')),
        type: 'POST',
        data: JSON.stringify({ employee: selectEmployee.id })
    }).done(function (response) {
        hideLoader();
        $('#empDetails').hide();
        blankEmployeeDetails();
        buildAlert('message', response);
    }).fail(function (error) {
        hideLoader();
        buildAlert('message', error);
    });
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
        blankEmployeeDetails();
        buildAlert('message', response);
    }).fail(function (error) {
        hideLoader();
        buildAlert('message', error);
    });
}

function fn_cancel() {
    blankEmployeeDetails();
    $("#txtSearch").val('');
    $('#empDetails').hide();
    emptyAlert('message');
}
