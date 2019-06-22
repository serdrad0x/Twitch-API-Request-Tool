// Ajax Request for scope.json
function scopeJSON(success){
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: encodeURI('api/twitch/'+apiRequestQuery["api"]+'/scope.json'),
        async: true,
        success: success
    });
}

// Ajax Request for request.json
function requestJSON(success){
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: encodeURI('api/twitch/'+apiRequestQuery["api"]+'/request.json'),
        async: true,
        success: success
    });
}

function updateParameters(requests, type){
    const apiRequest = $("#api_request option:selected")[0].value;
    const requestType = $("#request_type option:selected")[0].value;
    let addonLeft = 0;
    let addonRight = 0;
    const param_type = $('#'+type);
    const keys = {"required_query":"Required Query", "optional_query":"Optional Query", "required_body": "Required Body", "optional_body": "Optional Body"};

    param_type.empty();
    if(type in requests[apiRequest][requestType]) {
        param_type.append("<div style=\"margin-top:10px\" class=\"col-12\"><strong>"+keys[type]+" Parameters:</strong><br><br></div>");
        for (let key in requests[apiRequest][requestType][type]) {
            let value = requests[apiRequest][requestType][type][key];
            const length = $('#' + key).length;
            apiRequestQuery["parameters"].set(key + "_" + length, "");
            param_type.append(
                "<div class=\"col-lg-4 col-md-6 col-sm-12\">\n" +
                "  <div id=\""+key+"_"+ length+"\" class=\"input-group mb-3 param-input\">\n" +
                "    <div class=\"input-group-prepend\">\n" +
                "      <span class=\"input-group-text\">" + key + "</span>\n" +
                "      <span class=\"input-group-text\">" + value["type"] + "</span>\n" +
                "    </div>\n" +
                "    <input oninput=\"setParameters(this,'"+key+"_"+ length+"')\" name=\""+key+"\" type=\"text\" class=\"form-control\">\n" +
                "  </div>\n"+
                "</div>"
            );

            let amount = 1;
            if ("amount" in  value) {
                amount = value["amount"];
            }

            const paramInput = param_type.find(".param-input");
            if(requests[apiRequest][requestType][type][key]["amount"] > 1){
                paramInput.eq([paramInput.length - 1]).append(
                    "<div class=\"input-group-append\">\n" +
                    "    <button onclick=\"increaseInput('"+key+"_"+ length +"',"+amount+")\" value=\""+key+"_"+ length +"\" class=\"btn btn-outline-secondary\" type=\"button\"><b>+</b></button>\n" +
                    "    <button onclick=\"decreaseInput('"+key+"_"+ length +"')\" value=\""+key+"_"+ length +"\" class=\"btn btn-outline-secondary\" type=\"button\"><b>-</b></button>\n" +
                    "  </div>"
                );
            }

            const inputGroupPrepend = param_type.find(".input-group-prepend");
            // Get biggest width from left span
            if (addonLeft < inputGroupPrepend[inputGroupPrepend.length - 1].firstElementChild.clientWidth) {
                addonLeft = inputGroupPrepend[inputGroupPrepend.length - 1].firstElementChild.clientWidth;
            }

            // Get biggest width from right span
            if (addonRight < inputGroupPrepend[inputGroupPrepend.length - 1].lastElementChild.clientWidth) {
                addonRight = inputGroupPrepend[inputGroupPrepend.length - 1].lastElementChild.clientWidth;
            }
        }

        // Assign width to span
        param_type.find(".input-group-prepend").each(function () {
            this.firstElementChild.setAttribute("style", "width: " + addonLeft + "px");
            this.lastElementChild.setAttribute("style", "width: " + addonRight + "px");
        });
    }
}

let apiRequestQuery = {
    "api": "helix",
    "type": "get",
    "base": "https://api.twitch.tv",
    "entry_point": "",
    "parameters": new Map(),
    "path": new Map()
};

function setEntryPoint(element){
    apiRequestQuery["entry_point"] = $(element.options[element.selectedIndex]).val();
    apiRequestQuery["parameters"].clear();
    $("#api_result").html("&nbsp");
    setRequest();
}

function setType(element) {
    apiRequestQuery["type"] = $(element.options[element.selectedIndex]).val();
    apiRequestQuery["parameters"].clear();
    $("#api_result").html("&nbsp");
    setRequest();
}

function setParameters(element, key) {
    apiRequestQuery["parameters"].set(key, $(element).val());
    setRequest();
}

function setRequest(){
    let url = apiRequestQuery["type"].toUpperCase() +" /";
    let entryPoint = apiRequestQuery["entry_point"];
    let params = "";
    let separator = "?";

    for(const [key, value] of apiRequestQuery["path"]){
        if(value !== "") {
            entryPoint = entryPoint.replace(key, value);
        }
    }
    url += entryPoint;

    for(const [key, value] of apiRequestQuery["parameters"]) {
        if (value !== "") {
            const param = key.slice(0, key.lastIndexOf("_"));
            params += separator + param + "=" + value;
            if (separator === "?") {
                separator = "&";
            }
        }
    }
    $("#request").val(url + params);
}

function decreaseInput(element_id){
    const name = element_id.slice(0, element_id.lastIndexOf("_")); // Name without _X
    const id = $('input[name*="'+name+'"]').length; // ID of Element determined by length
    if(id > 1) {
        apiRequestQuery["parameters"].delete(element_id);
        $('#' + element_id).remove();
    }
}

function increaseInput(element_id, amount){
    if(amount > 1) {
        const name = element_id.slice(0, element_id.lastIndexOf("_")); // Name without _X
        let id = $('input[name*="' + name + '"]').length; // ID of Element determined by length
        if (id < amount) {
            id = 0;
            // Check if the element with ID already exist and assign new ID
            while ($("#" + name + "_" + id).length === 1) {
                id += 1;
            }
            const elementValue = $('#' + element_id);
            const input = elementValue.clone().attr("id", name + "_" + id); // Button of this cloned element must be adjusted!
            input.find("input").val("");
            input.find("input").attr("oninput", "setParameters(this,'" + name + "_" + id + "')");
            input.find("button").attr("value", name + "_" + id); // Add value to both (all) buttons of the cloned element
            input.find("button").eq(0).attr("onclick", "increaseInput('" + name + "_" + id + "', " + amount + ")"); // Increase
            input.find("button").eq(1).attr("onclick", "decreaseInput('" + name + "_" + id + "')"); // Decrease
            elementValue.after(input);
            apiRequestQuery["parameters"].set(name + "_" + id, "");
        }
    }
}

function requestParser(element){
    // POST /helix/user?code=123&code=456
    const type_re = /POST|GET|DELETE|PUT/;		// POST
    const entryPoint_re = /(?:\/)[^?]+/;		// /helix/user (?<=\/) not supported in Safari
    const parameters_re = /(?:\?)\S+=\S*?$/; 	// code=123&code=456
    const parameter_re = /^[^=&]+=[^=]*$/;		// code=123, code=456 <- check for each | Change [^=]+ to [^=]* to get code= instead of code=X (empty code=)

    // Check if written type is one, which can be selected.
    const type_match = type_re.exec($(element).val());
    let type_match_check = false;
    if(type_match) {
        $('#request_type option').each(function () {
            if ($(this).val() === type_match[0].toLowerCase()) {
                type_match_check = true;
                return false;
            }
        });
    }
    if(type_match_check){
        apiRequestQuery["type"] = type_match[0].toLowerCase(); // Set type parameter
        const entry_point_match = entryPoint_re.exec($(element).val());
        $("#request_type").selectpicker('val', type_match[0].toLowerCase()); // Set select to type
        if(entry_point_match){
            const parameters_match = parameters_re.exec($(element).val());
            const lastSetType = apiRequestQuery["type"];
            const lastSetEntryPoint = apiRequestQuery["entry_point"];
            const path_re = /<[^\/]+>/g;
            /*
            * To parse entry points for Kraken, you have to check kraken/feed/<channel ID>/posts/<post ID>/comments
            * as regex: kraken\/feed\/[^\/]+\/posts\/[^\/]+\/comments because path variables < ... > could be anything.
            * */
            $("#api_request option").each(function () {
                let epval = $(this).val();
                epval = epval.replace(path_re, "[^\\/]+");
                epval = epval.replace(/\//g, "\\/");
                if(new RegExp(epval).exec(entry_point_match[0].substr(1))){ // Check if the found entry_point is available
                    apiRequestQuery["entry_point"] = $(this).val(); // Set entry_point parameter
                    $("#api_request").selectpicker('val', $(this).val()); // Set select to entry_point
                    // Check if the type or entry_point has changed, since last check
                    if(lastSetType !== apiRequestQuery["type"] || lastSetEntryPoint !== apiRequestQuery["entry_point"]) {
                        requestJSON(updateDocumentationByRequest);
                        requestJSON(function (requests) {
                            updatePath(requests);
                            updateParameters(requests, "required_query");
                            updateParameters(requests, "optional_query");
                            updateParameters(requests, "required_body");
                            updateParameters(requests, "optional_body");
                        });
                    }
                    return false; // There can be only one entry, so if it was found, exit each()
                }
            });
            requestJSON(function (requests) {
                if(parameters_match){
                    let parameters_list_success = {};
                    const parameters_list = parameters_match[0].substr(1).split("&"); // code=1&code=2&code=3 -> [code=1, code=2, code=3]
                    const param_types = ["required_query", "optional_query", "required_body", "optional_body"];
                    let bases = [];
                    /*
                    * Step 1:
                    * Go through parameters_list and remove all incorrect entries!
                    * Add all correct entries with amount to parameters_list_success -> [[[code, 1], 20], [[code, 2], 20], [[code, 3], 20]]
                    * */
                    for (let i=0; i < parameters_list.length; i++) {
                        const parameter_match = parameter_re.exec(parameters_list[i]);
                        if(parameter_match) { // Parameter is X=X and not something like X or X==X
                            const parameter_split = parameters_list[i].split("="); // From code=1 to [code, 1] // Base of code_0 is code
                            for (let param_type of param_types) { // in = key, of = value
                                if(typeof requests[apiRequestQuery["entry_point"]][apiRequestQuery["type"]][param_type] !== "undefined"){
                                    if (Object.keys(requests[apiRequestQuery["entry_point"]][apiRequestQuery["type"]][param_type]).length !== 0) {
                                        let amount = 1;
                                        for (let param_available in requests[apiRequestQuery["entry_point"]][apiRequestQuery["type"]][param_type]) { // Check if param_base = param found from request.json
                                            if (param_available === parameter_split[0]) {
                                                if ("amount" in requests[apiRequestQuery["entry_point"]][apiRequestQuery["type"].toLowerCase()][param_type][parameter_split[0]]) {
                                                    amount = requests[apiRequestQuery["entry_point"]][apiRequestQuery["type"].toLowerCase()][param_type][parameter_split[0]]["amount"];
                                                }

                                                if (typeof parameters_list_success[parameter_split[0]] === "undefined") {
                                                    parameters_list_success[parameter_split[0]] = {
                                                        "elements": [],
                                                        "last": undefined,
                                                        "counter": 0
                                                    };
                                                }

                                                parameters_list_success[parameter_split[0]]["elements"].push({
                                                    "value": parameter_split[1],
                                                    "amount": amount
                                                });

                                            }
                                            if (!bases.includes(param_available)) {
                                                bases.push(param_available);
                                            }
                                        }
                                    }
                                }
                            }
                        } // else {console.log("Info: Parameter is malformed");} // Parameter is malformed
                    }

                    /*
                    * Step 2:
                    * Set value of available inputs or increase if necessary
                    * */
                    for (let base in parameters_list_success) {
                        for(let i = 0; i < parameters_list_success[base]["elements"].length; i++){
                            const value = parameters_list_success[base]["elements"][i]["value"];
                            let amount = 1;

                            if ("amount" in parameters_list_success[base]["elements"][i]){
                                amount = parameters_list_success[base]["elements"][i]["amount"];
                            }

                            const div = $('div[id^="'+base+'"]').eq(i); // DIV element with id = base

                            if (div.length !== 0) { // Check if input exists
                                div.find("input").val(value); // DIV only has one input
                                apiRequestQuery["parameters"].set(div.attr("id"), value);
                                parameters_list_success[base]["last"] = div;
                            } else {
                                // console.log("Info: According input field could not be found");
                                if (typeof parameters_list_success[base]["last"] !== "undefined") {
                                    increaseInput(parameters_list_success[base]["last"].find("button").eq(0).val(), amount);
                                    parameters_list_success[base]["counter"] += 1;
                                    div.find("input").val(value);
                                } // else {console.log("Error: last is not initialized")} // Should never occur
                            }
                        }
                    }

                    /*
                    * Step 3:
                    * Remove unnecessary inputs
                    * */
                    for (let base in parameters_list_success){
                        const div_base = $('div[id^="'+base+'"]');
                        if(div_base.length - parameters_list_success[base]["counter"] > parameters_list_success[base]["elements"].length) {
                            for (let i = div_base.length - 1; i >= parameters_list_success[base]["elements"].length; i--) {
                                decreaseInput($('div[id^="' + base + '"]').eq(i).find("button").eq(1).val());
                            }
                        }
                    }

                    for (let base of bases){
                        const div_base = $('div[id^="'+base+'"]');
                        if(typeof parameters_list_success[base] === "undefined"){
                            div_base.find("input").val("");
                            apiRequestQuery["parameters"].set(div_base.attr("id"), "");
                        }
                    }
                } // else {console.log("Error: No parameters were found");} // No parameters were found
            });
        } // else {console.log("Error: No entry_point was found");} // No entry_point was found
    } // else {console.log("Error: No type was found");} // No type was found
    // console.log("--------------------");
}

// Select API Requests by type of request (get/post)
let updateEntryPointsByRequestType = function(requests) {
    const requestType = $("#request_type option:selected")[0].value;
    const apiRequest = $("#api_request");
    apiRequest.empty();
    $.each(requests, function(key, value) {
        if(requestType in value){
            $('#api_request')
                .append($("<option></option>")
                    .attr("value",key)
                    .text(key));
        }
    });
    // Set initialize value to first element of the list.
    // Otherwise, there is a fill text (Please select) but the first element is still selected but not shown.
    const apiRequest_selected = $("#api_request option:selected");
    apiRequest.selectpicker('val', apiRequest_selected[0].value);
    apiRequestQuery["entry_point"] = apiRequest_selected[0].value;
    apiRequest.selectpicker("refresh");
    requestJSON(updateDocumentationByRequest);// Add elements to dropdown list API request
    requestJSON(updateParametersByRequest);
};

// Generate Documentation from JSON
let updateDocumentationByRequest = function (requests) {
    const requestType = $("#request_type option:selected")[0].value;
    const apiRequest = $("#api_request option:selected")[0].value;

    const keys = {"required_query":"Required Query", "optional_query":"Optional Query", "required_body": "Required Body", "optional_body": "Optional Body", "response": "Response", "path": "Path"};

    for(let key in keys) {
        $("#" + key + "_docu").empty();
        if (key in requests[apiRequest][requestType]) {
            if (createTable(key + "_docu", requests[apiRequest][requestType][key])) {
                $("#" + key + "_docu").prepend("<strong>" + keys[key] + " Parameters:</strong><br><br>");
            }
        }
    }

    if ("code_status" in requests[apiRequest][requestType]){
        const codeStatusDocu = $("#code_status_docu");
        codeStatusDocu.empty();
        if(Object.keys(requests[apiRequest][requestType]["code_status"]).length > 0){
            codeStatusDocu.append(
                $('<table>', {id: 'code_status_table', class: 'table table-striped'}).append(
                    $('<thead>').append(
                        $('<tr>').append(
                            $('<th>').text('Code Status'),
                            $('<th>').text('Description')
                        )
                    ),
                    $('<tbody>')
                )
            );
            $.each(requests[apiRequest][requestType]["code_status"], function(key, value) {
                let table = $('<tr>').append(
                    $('<td>').text(key),
                    $('<td>', {class: "white-space-pre"}).text(value['description'])
                );
                $("#code_status_table").append(table);
            });
            codeStatusDocu.prepend("<strong>Code Statuses:</strong>")
        }
    }

    if("scopes" in requests[apiRequest][requestType]) {
        scopeJSON(function (scopes) {
            const need_scope_docu = $('#need_scope_docu');
            need_scope_docu.append(
                $('<table>', {id: 'need_scope_docu_table', class: 'table table-striped'}).append(
                    $('<thead>').append(
                        $('<tr>').append(
                            $('<th>').text('Scope'),
                            $('<th>').text('Description'),
                        )
                    ),
                    $('<tbody>')
                )
            );
            // Needed Scopes for this Request
            $.each(requests[apiRequest]['scopes'], function (key, value) {
                let table = $('<tr>').append(
                    $('<td>').text(value),
                    $('<td>').text(scopes[value]),
                );
                $("#need_scope_docu_table").append(table);
            });
            need_scope_docu.prepend("<strong>Required Scopes:</strong><br><br>");
        });
    }

    // URL to Twitch API Documentation
    row(
        "#twitch_api_docu",
        $("<a>", {href: requests[apiRequest][requestType]['docs'], target: "_blank"}).text(requests[apiRequest][requestType]['docs']),
        "Twitch API Documentation:"
    );
};

function row(id, data, heading){
    let element = $(id);
    element.empty();
    element.append(
        data
    );
    element.prepend("<strong>"+heading+"</strong><br><br>");
}

function createTable(id, request){
    const table_id = $("#"+id);
    table_id.empty();
    if(Object.keys(request).length > 0){
        table_id.append(
            $('<table>', {id: id+'_table', class: 'table table-striped'}).append(
                $('<thead>').append(
                    $('<tr>').append(
                        $('<th>').text('Param'),
                        $('<th>').text('Type'),
                        $('<th>').text('Description')
                    )
                ),
                $('<tbody>')
            )
        );
        $.each(request, function(key, value) {
            let table = $('<tr>').append(
                $('<td>').text(key),
                $('<td>').text(value['type']),
                $('<td>', {class: "white-space-pre"}).text(value['description'])
            );
            $("#"+id+"_table").append(table);
        });
        return true;
    }
    return false;
}

let updateParametersByRequest = function(requests){
    updatePath(requests);
    updateParameters(requests, "required_query");
    updateParameters(requests, "optional_query");
    updateParameters(requests, "required_body");
    updateParameters(requests, "optional_body");
    setRequest();
};

function getUrlParameters(){
    let pageUrl = window.location.href.slice(window.location.href.lastIndexOf("#")+1);
    let urlVariables = pageUrl.split("&");
    let result = {};
    for (let i = 0; i < urlVariables.length; i++){
        const resultPair = urlVariables[i].split("=");
        result[resultPair[0]] = resultPair[1];
    }
    return result;
}

let loadRequestType = function(requests){
    const requestTypeDiv = $('#request_type');
    requestTypeDiv.empty();
    let result = [];
    for(let entryPoint in requests){
        for(let requestType in requests[entryPoint]){
            if(!result.includes(requestType)){
                result.push(requestType);
                requestTypeDiv
                    .append($("<option></option>")
                        .attr("value", requestType)
                        .text(requestType.toUpperCase())
                    )
            }
        }
    }
    requestTypeDiv.selectpicker('val', result[0].value);
    requestTypeDiv.selectpicker("refresh");
};

let loadScope = function(scopes) {
    $("#scope_div").html("<label for=\"scope\">Scope</label><select name=\"states\" id=\"scope\" class=\"form-control\" multiple=\"multiple\" style=\"display: none;\"></select>");
    let scope_select = $('#scope');
    let selected = [];

    if(localStorage.getItem(apiRequestQuery["api"] + "_scopes") !== null){
        selected = localStorage.getItem(apiRequestQuery["api"] + "_scopes").split("+");
    }

    for(let scope in scopes){
        if(selected.includes(scope)) {
            scope_select
                .append($("<option></option>")
                    .attr("value", scope)
                    .attr("selected", "selected")
                    .text(scope));
        } else {
            scope_select
                .append($("<option></option>")
                    .attr("value", scope)
                    .text(scope));
        }
    }

    scope_select.bsMultiSelect();
};

function updatePath(requests){
    const apiRequest = $("#api_request option:selected")[0].value;
    const requestType = $("#request_type option:selected")[0].value;
    const path = $("#path");
    let addonLeft = 0;
    let addonRight = 0;

    path.empty();
    if("path" in requests[apiRequest][requestType]) {
        path.append("<div style=\"margin-top:10px\" class=\"col-12\"><strong>Path Parameters:</strong><br><br></div>");
        for (let key in requests[apiRequest][requestType]["path"]) {
            apiRequestQuery["path"].set(key, key);
            let value = requests[apiRequest][requestType]["path"][key];

            path.append(
                "<div class=\"col-lg-4 col-md-6 col-sm-12\">\n" +
                "  <div id=\"" + key + "\" class=\"input-group mb-3 param-input\">\n" +
                "    <div class=\"input-group-prepend\">\n" +
                "      <span class=\"input-group-text\">" + key.replace("<", "&lt;").replace(">", "&gt;") + "</span>\n" +
                "      <span class=\"input-group-text\">" + value["type"] + "</span>\n" +
                "    </div>\n" +
                "    <input oninput=\"setPath(this,'" + key + "')\" name=\"" + key + "\" type=\"text\" class=\"form-control\">\n" +
                "  </div>\n" +
                "</div>"
            );

            const inputGroupPrepend = path.find(".input-group-prepend");
            // Get biggest width from left span
            if (addonLeft < inputGroupPrepend[inputGroupPrepend.length - 1].firstElementChild.clientWidth) {
                addonLeft = inputGroupPrepend[inputGroupPrepend.length - 1].firstElementChild.clientWidth;
            }

            // Get biggest width from right span
            if (addonRight < inputGroupPrepend[inputGroupPrepend.length - 1].lastElementChild.clientWidth) {
                addonRight = inputGroupPrepend[inputGroupPrepend.length - 1].lastElementChild.clientWidth;
            }
        }

        path.find(".input-group-prepend").each(function () {
            this.firstElementChild.setAttribute("style", "width: " + addonLeft + "px");
            this.lastElementChild.setAttribute("style", "width: " + addonRight + "px");
        });
    }
}

function setPath(element, key){
    apiRequestQuery["path"].set(key, $(element).val());
    setRequest();
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function setApiResult(response){
    const api_result = $("#api_result");
    api_result.empty();
    api_result
        .html(syntaxHighlight(
            JSON.stringify(
                response,
                undefined,
                4
            )
        ));
}

$(document).ready(function() {
    const params = getUrlParameters();
    if("access_token" in params){
        localStorage.setItem("access_token", params["access_token"]);
        $("#token_used").val(params["access_token"]);
    } else if(localStorage.getItem("access_token") !== null){
        $("#token_used").val(localStorage.getItem("access_token"));
    }

    if(localStorage.getItem("client_id") !== null){
        $('#client_id').val(localStorage.getItem("client_id"));
    }

    // Initialize values!
    requestJSON(loadRequestType); // Add elements to entry point
    scopeJSON(loadScope);  // Add elements to scope

    requestJSON(updateEntryPointsByRequestType);

    $("#api_type").change(function () {
        apiRequestQuery["api"] = $("#api_type option:selected")[0].value;

        if(apiRequestQuery["api"] !== "kraken"){
            apiRequestQuery["path"].clear();
        }

        if(localStorage.getItem("access_token") !== null){
            $("#token_used").val(localStorage.getItem("access_token"));
        } else {
            $("#token_used").val("");
        }

        requestJSON(loadRequestType); // Add elements to entry point
        scopeJSON(loadScope);  // Add elements to scope

        requestJSON(updateEntryPointsByRequestType);
    });

    // If the type of request (get/post) is changed, while a request (helix/entitlements/...) is selected, the documentation must be updated!
    $("#request_type").change(function() {
        apiRequestQuery["path"].clear();
        requestJSON(updateEntryPointsByRequestType);
    });

    // Update Documentation depending on API request!
    $("#api_request").change(function () {
        apiRequestQuery["path"].clear();
        requestJSON(updateDocumentationByRequest);
        requestJSON(updateParametersByRequest);
    });

    $('#generateToken').click(function () {
        let scopes = "";
        const base_uri = "https://id.twitch.tv/oauth2/authorize";
        const redirect_uri = "http://tart.retro-elite.de/index.html";
        const client_id = $('#client_id').val();
        const selected = $('#scope option:selected');

        for (let i = 0; i < selected.length; i++){
            scopes += selected[i].value + "+";
        }
        scopes = scopes.slice(0,-1);

        localStorage.setItem("client_id", client_id);
        localStorage.setItem(apiRequestQuery["api"] +  "_scopes", scopes);

        window.open(base_uri + "?client_id=" + client_id + "&force_verify=true&redirect_uri=" + redirect_uri + "&response_type=token&scope=" + scopes, "_self");
    });

    $('#send').click(function () {
        const client_id = $('#client_id').val();
        const accessToken = $('#token_used').val();
        const auth = {"helix": "Bearer", "kraken": "OAuth"};
        let entryPoint = apiRequestQuery["entry_point"];
        let headers = {
            'Client-ID': client_id
        };
        let data = "?";

        if(accessToken !== ""){
            headers['Authorization'] = auth[apiRequestQuery["api"]] + ' ' + accessToken;
        }

        for(const [key, value] of apiRequestQuery["parameters"]){
            if(value !== "") {
                data += key.slice(0, key.lastIndexOf("_")) + "=" + value + "&";
            }
        }
        data = data.slice(0,-1);

        if(apiRequestQuery["api"] === "kraken"){
            headers["Accept"] = "application/vnd.twitchtv.v5+json";
            for(const [key, value] of apiRequestQuery["path"]){
                if(value !== "") {
                    entryPoint = entryPoint.replace(key, value);
                }
            }
        }

        $.ajax({
            type: apiRequestQuery["type"],
            dataType: 'json',
            url: encodeURI(apiRequestQuery["base"] + "/" + entryPoint + data),
            headers: headers,
            async: true,
            success: function (response) {
                setApiResult(response);
            },
            error: function (response) {
                setApiResult(response["responseJSON"]);
            }
        });
    });

    $('#token_revoke').click(function () {
        const client_id = $('#client_id').val();
        const accessToken = $('#token_used').val();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: encodeURI("https://id.twitch.tv/oauth2/revoke"),
            async: true,
            data: {
                client_id: client_id,
                token: accessToken
            },
            success: function (response) {
                // Revoke only returns an error with different status!
            },
            error: function (response) {
                if(response["status"] === 400){
                    setApiResult(response["responseJSON"]);
                } else if(response["status"] === 200){
                    setApiResult({"status": 200, "message": "Token removed"});
                    $("#token_used").val();
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("helix_scopes");
                    localStorage.removeItem("kraken_scopes");
                }
            }
        });
    });

    $('#token_validate').click(function () {
        const accessToken = $('#token_used').val();
        const auth = "OAuth"; // Only works with OAuth!

        $.ajax({
            type: "GET",
            dataType: "json",
            url: encodeURI("https://id.twitch.tv/oauth2/validate"),
            headers: {
                'Authorization': auth + ' ' + accessToken
            },
            async: true,
            success: function (response) {
                setApiResult(response);
            },
            error: function (response) {
                setApiResult(response["responseJSON"]);
            }
        });
    });

    $('#getID').click(function () {
        const username = $('#username').val();
        const client_id = $('#client_id').val();
        const accessToken = $('#token_used').val();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: encodeURI("https://api.twitch.tv/helix/users"),
            headers: {
                "Client-ID": client_id,
                'Authorization': 'Bearer '+accessToken
            },
            data: {
                login: username
            },
            async: true,
            success: function (response) {
                $('#userid').val(response["data"][0]["id"]);
            },
            error: function () {
                $('#userid').val("No ID found!");
            }
        });
    });

    $('#getName').click(function () {
        const userID = $('#userid').val();
        const client_id = $('#client_id').val();
        const accessToken = $('#token_used').val();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: encodeURI("https://api.twitch.tv/helix/users"),
            headers: {
                "Client-ID": client_id,
                'Authorization': 'Bearer '+accessToken
            },
            data: {
                id: userID
            },
            async: true,
            success: function (response) {
                $('#username').val(response["data"][0]["display_name"]);
            },
            error: function () {
                $('#username').val("No Username found!");
            }
        });
    });

    $("#visibility").click(function() {
        const tokenUsed = $('#token_used');
        if(tokenUsed.attr("type") === "text"){
            tokenUsed.attr('type', 'password');
            $('#visibility').text("Show");
        }else if(tokenUsed.attr("type") === "password"){
            tokenUsed.attr('type', 'text');
            $('#visibility').text("Hide");
        }
    });
});
