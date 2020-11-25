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
    blankEmployeeDetails();
    var hasValidationError = checkIfEmptyAndValidate('txtSearch', 'search_field_error', 'Please provide employee name.');
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
    $('#txtName').html(employee.first + ' ' + employee.middle + ' ' + employee.last);
    $('#txtMobile').html(employee.mobileNo);
    $('#txtType').html(employee.type);
    $('#txtSalary').html(employee.salary);
}

function blankEmployeeDetails() {
    $('#txtId').val('');
    $('#txtName').html('');
    $('#txtMobile').html('');
    $('#txtSalary').html('');
    $('#txtSalaryType').val('');
}

function fn_process() {
    var hasValidationError = checkIfEmptyAndValidate('txtSalaryType', 'type_field_error', 'Please select type of Salary');
    if (!hasValidationError) {
        var advFieldVisible = fn_showFields();
        var requestUrl = '';
        var jsonObject = {};
        if (advFieldVisible) {
            //Make Advance Salary Payment
            hasValidationError = checkIfEmptyAndValidate('txtAdvSalary', 'adv_salary_field_error', 'Please enter addvance salary amount.');
            if (!hasValidationError) hasValidationError = checkSalaryAndValidate('txtAdvSalary', 'adv_salary_field_error', 'Please provide valid amount.');
            if (!hasValidationError) {
                requestUrl = endPointsMap.get('ADV_SAL_URI');
                jsonObject = { employee: $('#txtId').val().trim(), advanceSalary: $('#txtAdvSalary').val().trim() };
            }
        } else {
            //Make Full Salary Payment
            requestUrl = endPointsMap.get('FULL_SAL_URI');
            jsonObject = { employee: $('#txtId').val().trim() };
        }

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

function fn_showFields() {
    var salType = $('#txtSalaryType');
    if (salType && salType.val().trim() == 'ADV') {
        $('#advDiv').show();
    } else {
        $('#advDiv').hide();
        return false;
    }
    return true;
}

