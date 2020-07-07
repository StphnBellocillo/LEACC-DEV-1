/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(["N/record", "N/file", "N/search", "N/redirect"], function(
    record,
    file,
    search,
    redirect
) {
    var exports = {},
        HTML_TEMPLATE_PATH = "SuiteScripts/Customer/contactinformation.html.html",
        SUITELET_URL =
        "https://1563405.extforms.netsuite.com//app/site/hosting/scriptlet.nl?script=238&deploy=1";

    function onRequest(context) {
        if (context.request.method === "GET") {
            renderHTMLTemplateExternal(context);
        } else {
            var id = createCustomer(context.request.parameters);

            redirect.toRecord({
                type: record.Type.CUSTOMER,
                id: id,
            });
        }

        return;
    }

    function renderHTMLTemplateExternal(context) {
        var htmlContent = file
            .load({
                id: HTML_TEMPLATE_PATH,
            })
            .getContents();
        var departments = getDepartments();
        htmlContent = htmlContent
            .replace("{{SUITELET_LINK}}", SUITELET_URL)
            .replace("${COMMITTEE}", JSON.stringify({ data: departments }));

        context.response.write(htmlContent);
    }

    function getDepartments() {
        var departments = [];
        search
            .create({
                type: "department",
                columns: ["name"],
                filter: [],
            })
            .run()
            .each(function(result) {
                departments.push({
                    name: result.getValue("name"),
                    id: result.id,
                });
                return true;
            });

        return departments;
    }

    function createCustomer(params) {
        return record
            .create({
                type: "customer",
            })
            .setValue({
                fieldId: "firstname",
                value: params.firstname,
            })
            .setValue({
                fieldId: "lastname",
                value: params.lastname,
            })
            .setValue({
                fieldId: "email",
                values: params.email,
            })
            .setValue({
                fieldId: "phone",
                values: params.phone,
            })
            .setValue({
                fieldId: "street",
                value: params.street,
            })
            .setValue({
                fieldId: "address2",
                value: params.address2,
            })
            .setValue({
                fieldId: "city",
                value: params.city,
            })
            .setValue({
                fieldId: "province",
                value: params.province,
            })
            .setValue({
                fieldId: "zip",
                value: params.zip,
            })
            .setValue({
                fieldId: "country",
                value: params.country,
            })
            .setValue({
                fieldId: "department",
                value: params.committee,
            })
            .setValue({
                fieldId: "subsidiary",
                value: 1,
            })
            .save();
    }

    exports.onRequest = onRequest;
    return exports;
});