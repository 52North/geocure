/**
This library is intended to serve functions which allow to control the execution of the server
**/

// Is intended to be used to trace the request of an endpoint.
function logStart(URL) {
    console.log("++++++++++++++ START -> " + URL + " +++++++++++++++++");
}

// Is intended to be used to indicate if the execution of an endpoint ends.
function logEnd(URL) {
    console.log("++++++++++++++++ END -> " + URL + " +++++++++++++++++");
}


/**
Signature: serviceConfigurationValid : Array -> JSON-Object

Description: Checks the validity of the file which contains the description of the services.
Returns true, if if fullfills all requirements.
Otherwise it fill return falls and log why the test failed.

**/
function serviceConfigurationValid(services) {
    console.log("At function serviceConfigurationValid()");
    services.forEach(function(entry) {
        if (!("id" in entry)) {
            console.log("The key 'id' is missing");
            return false;
        }
        if (!("href" in entry)) {
            console.log("The key 'href' is missing");
            return false;
        }
        if (!("baseURLService" in entry)) {
            console.log("The key 'baseURLService' is missing");
            return false;
        }
    })
    console.log("Finishing serviceConfigurationValid()");
    return true;
}

module.exports = {
    logStart: logStart,
    logEnd: logEnd
}
