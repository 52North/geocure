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
function serviceConfigurationValid(services) {;
    console.log("At function serviceConfigurationValid()");

    services.forEach(function(entry) {
        if (!("id" in entry)) {
            console.log("The key 'id' is missing");
            process.exit();
        }
        if (!("href" in entry)) {
            console.log("The key 'href' is missing");
            process.exit();
        }
        if (!("baseURLService" in entry)) {
            console.log("The key 'baseURLService' is missing");
            process.exit();
        }
        if (!("capabilities" in entry)) {
            console.log("The key 'capabilities' is missing");
            process.exit();
        }
        if ("capabilities" in entry) {
            if ("maps" in entry.capabilities) {
              if (!(typeof(entry.capabilities.maps)) === "object") {
                  console.log("The value of 'maps' has to be a object");
                  process.exit();
              }

              if (!("defaultWidth" in entry.capabilities.maps)) {
                  console.log("The capabilities of maps do not contain width.");
                  process.exit();
              }

              if (!(typeof(entry.capabilities.maps.defaultWidth)) === "number" || entry.capabilities.maps.width <= 0) {
                  console.log("The value of 'width' has to be a number > 0");
                  process.exit();
              }

              if (!("defaultHeight" in entry.capabilities.maps)) {
                  console.log("The capabilities of maps do not contain defaultHeight.");
                  process.exit();
              }

              if (!(typeof(entry.capabilities.maps.defaultHeight)) === "number" || entry.capabilities.maps.width <= 0) {
                  console.log("The value of 'height' has to be a number > 0");
                  process.exit();
              }

              if (!("defaultFormat" in entry.capabilities.maps)) {
                  console.log("The defaultformat for maps is missing");
                  process.exit();
              }
            }

            if ("features" in entry.capabilities) {
              if (!("defaultFormat" in entry.capabilities.features)) {
                  console.log("The defaultformat for features is missing");
                  process.exit();
              }
            }
          }
    })
    console.log("Finishing serviceConfigurationValid()");
}

module.exports = {
    logStart: logStart,
    logEnd: logEnd,
    serviceConfigurationValid: serviceConfigurationValid
}
