/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
var RECORD, SEARCH, FILE;
var savesSearchId = "customsearch_employee_exam";
var debugtitle = "EMPLOYEE TEST";
var objRecords = {};
var csvValue = "";
define(["N/record", "N/search", "N/file"], function(record, search, file) {
    RECORD = record;
    SEARCH = search;
    FILE = file;

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize,
    };
});

function getInputData(context) {
    log.debug(debugtitle, "*** START ***");

    //Load the Saved Search
    var searchObj = SEARCH.load({
        id: savesSearchId,
    });

    log.debug(debugtitle, searchObj);

    var arrFilters = searchObj.filters;
    var arrColumns = searchObj.columns;

    log.debug("filter", arrFilters);
    log.debug("column", arrColumns);
    // var
    // log.debug("search result", searchresult);
    // return SEARCH.create({
    //     type: searchObj.searchType,
    //     filters: arrFilters,
    //     columns: arrColumns
    // });
    return SEARCH.create({
        type: searchObj.searchType,
        filters: arrFilters,
        columns: arrColumns,
    });
}

// consolidation of record through saves search
function map(context) {
    try {
        log.debug(debugtitle, ">> value:: " + JSON.stringify(context.value));

        var contextValue = JSON.parse(context.value);

        // log.debug(debugtitle, '>>contextValue.i' + contextValue.id);

        // log.debug("contextvalue", contextValue.id);
        var recId = contextValue.id;
        var name = contextValue.values["entityid"];
        var email = contextValue.values["email"];
        var phone = contextValue.values["phone"];
        var supervisor = contextValue.values["supervisor"];

        // var supervisorName = supervisor["text"];
        // log.debug('supervisor name', supervisorName);
        // var supervisor = contextValue.value.supervisor["text"];
        log.debug("supervisor checking", supervisor);
        objRecords = {
            name: name,
            email: email,
            phone: phone,
            supervisor: supervisor,
        };

        // log.debug("rec id", recId);

        log.debug("END MAP", objRecords);
    } catch (ex) {
        log.debug(debugtitle, ">>Error " + ex);
    }
    context.write(recId, objRecords);
}

function reduce(context) {
    log.debug(
        "reduce.key: " + context.key + ": ",
        JSON.stringify(context.values)
    );

    context.values.forEach(function(value) {
        objRecords = JSON.parse(value);

        log.debug("reduce", objRecords);
    });

    for (var key in objRecords) {
        csvValue += objRecords[key] + " ";
    }
    log.debug("file", csvValue);

    var csvFile = FILE.create({
        name: "csv.csv",
        contents: csvValue,
        folder: 549,
        fileType: "CSV",
    });

    var csvFileId = csvFile.save();

    context.write(objRecords.recId, csvValue);
}

// The summarize stage is a serial stage, so this function is invoked only one
// time.

function summarize(context) {
    log.debug("Summarizing && Saving...", csvValue);

    context.write(files);
}

function createAndSaveFile() {
    var csvFile = FILE.create({
        name: "csv.csv",
        contents: "Employee Information\n",
        folder: 549,
        fileType: "CSV",
    });

    csvFile.appendLine({
        value: "10/21/14,200.0",
    });
    var csvFileId = csvFile.save();
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
    }

    return true;
}