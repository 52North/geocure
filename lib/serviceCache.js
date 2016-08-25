/**
Stories the getCapabilities of all offered services.
**/

// Internal libraries
var processXML = require("./processXML");
var processJSON = require("./processJSON");

var services = {};


var updateServices = function(servicesDescription) {
  console.log("At function updateServices()");
    var serviceURLs = [] // Array stores the URL of the offered services. Array used to run in function requestCapabilities over it.
    for (var i = 0; i < servicesDescription.length; i++) {
        var id = servicesDescription[i].id;
        var url = processJSON.getGetCapabilitiesURL(servicesDescription, id); // constructs the URL to a given SerivceID from the ServiceDescriptions
        serviceURLs.push({
            id: id,
            url: url
        }); // After constructions, pushs them to the Array
    }

    var requestCapabilities = function(url) {
        // creates JSON from a given url to getCapabilites of a service.
        // function(json) is executed on the getCapabilities in JSON-format (callback!)
        processXML.unmarshallXML(url.url, function(json) {
            services[url.id] = json; // Adds the id of the service and its JSON-GetCapabilites
            //console.log(JSON.stringify(services)); // Used for testing
            var next = serviceURLs.pop(); // get next URl
            if (next) { // is there a next URL?
                requestCapabilities(next); // then add this URL to services
            }
        })
    }
    requestCapabilities(serviceURLs.pop()); // start the process of adding JSON-GetCapabilities to services
    console.log("Finishing updateServices()");
}

// Returns all JSON-GetCapabilities at once
var getServices = function() {
  console.log("At function getServices()");
  console.log("Finishing getServices()");
    return services;
}

module.exports = {
    getServices: getServices,
    updateServices: updateServices
}
