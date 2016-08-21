var restify = require("restify");
var restifySwagger = require("node-restify-swagger");
var requestUtils = require("./request-utils");
var serviceCache = require("./serviceCache");
var fs = require("fs");


var error = require("restify-error");
var requesting = require("request"); // Delete?
var http = require("http") // Delete?

// Own libraries
var helpingFunctions = require("./helpingFunctions");
var controlExecution = require("./controlExecution");
var processJSON = require("./processJSON");
var processGetCapabilities = require("./processGetCapabilities");

var server = module.exports.server = restify.createServer();
var services = require("../services/services.json"); // Links the file, containing all services


if (!services) {
    console.log("The file services.json (containing the description if the services) is not available");
    return;
}
// ERROR-HANDLING: Stops the server if not all keys are given in services.json
if (!helpingFunctions.checkServices(services)) {
    console.log("The file services.json does not contain above named keys");
    return;
}

server.name = "geocure";

server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.bodyParser());

restifySwagger.configure(server, {
    info: {
        title: "52°North geocure API",
        description: "52°North geocure API",
        contact: "m.rieke@52north.org",
        license: "MIT",
        licenseUrl: "http://opensource.org/licenses/MIT"
    },
    apiDescriptions: {
        "get": "GET API",
        "post": "POST API for complex requests"
    }
});

/**
 * API Docs contents
 * see http://mcavage.me/node-restify/#serve-static for usage
 **/
server.get(/\/apidocs\/?.*/, restify.serveStatic({
    directory: "./documentation",
    default: "index.html"
}));
server.get("/", function(req, res, next) {
    res.header("Location", "/apidocs/index.html");
    res.send(302);
    return next(false);
});

/**
 * Services Resource base controller
 */



server.get({
    url: "/services",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to geodata services",
    }
}, function(req, res, next) {

    // Information for tracing
    requestUtils.injectFullUrl(req);
    controlExecution.logStart(req.fullUrl);

    // Template for Output
    var output = [];

    // Object type for the overview of a single service
    function ServiceOverview(id, label, description, href) {
        this.id = id;
        this.label = label;
        this.description = description;
        var RequestURL = req.fullUrl;
        this.href = RequestURL + "/" + this.id;
    }

    // By constructing the output. Way to avoid redudant information about services in different files.

    services.forEach(function(serviceElement) {
        var aService = new ServiceOverview(serviceElement.id, serviceElement.label, serviceElement.description, serviceElement.href);
        output.push(aService);
    })


    res.send(output);
    controlExecution.logEnd(req.fullUrl);
});

/**
 * Service entry Resource base controller
 */
server.get({
        url: "/services/:id",
        swagger: {
            summary: "service entry resource",
            notes: "this resource provides access to a geodata service",
        }
    },

    function(req, res, next) {

        requestUtils.injectFullUrl(req);
        controlExecution.logStart(req.fullUrl);

        // Template for result
        function ServiceInformation(id, label, description) {
            this.id = id;
            this.label = label;
            this.description = description;
            var RequestURL = req.fullUrl;
            this.capabilities = [RequestURL + "/maps", RequestURL + "/features"];
        }


        // ERROR-HANDLING
        // services checked after starting the server for required keys, so "id" exists. Here check for the value of the key.

        var checkedRequest = processJSON.getKeyValueObject(services, "id", req.params.id);
        console.log("Does the requested id " + req.params.id + " exists?");
        if (!checkedRequest) {
            return next(new error.BadRequestError("No service with id " + req.params.id));

        }
        console.log("Yes, the requested id exists");


        res.send(new ServiceInformation(checkedRequest.id, checkedRequest.label, checkedRequest.description));
        controlExecution.logEnd(req.fullUrl);
    });



server.get({
    url: "/services/:id/maps",
    swagger: {
        summary: "service entry resource",
        notes: "this resource provides access to a geodata service",
    }
}, function(req, res, next) {
    requestUtils.injectFullUrl(req);
    controlExecution.logStart(req.fullUrl);
    // ERROR-HANDLING
    console.log("Does the requested id " + req.params.id + " exists?");
    if (!processJSON.getKeyValueObject(services, "id", req.params.id)) {
        return next(new error.BadRequestError("No service with id " + req.params.id));
    }
    console.log("Yes, the requested id exists");


    // ERROR-HANDLING: services tested after serverstart, req.params.id checked at the beginning of this endpoint
    var url = processJSON.getGetCapabilitiesURL(services, req.params.id);
    //console.log(serviceCache);
    var json = serviceCache.getServices()[req.params.id]; // Get JSON-GetCapabilities to requestet
    //console.log(json);
    // ERROR-HANDLING
    console.log("Does the json-file for the requested service exist?");
    if (!json) {
        return next(new error.InternalServerError("required json-file is not available. Please wait and reload again."));
    }
    console.log("Yes, the json-file for the requested service exists");


    // Template for the output
    function mapInfoTemplate() {
        this.layers = [];
        this.crs = [];
        this.addLayer = function(layerObject) {
            this.layers.push(layerObject);
        }
        this.addCrs = function(crsInfo) {
            this.crs = crsInfo;
        }
    }

    var mapinfo = new mapInfoTemplate(); // Need it to fill it in the following lines with information
    var layer = json.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
    console.log("Layerlength = " + layer.length);
    //console.log(layer);

    // ERROR-HANDLING
    console.log("Does json.WMS_Capabilities.capability.layer exists?");
    if (!layer) {
        return next(new error.InternalServerError("Information about layer is not available"));
    }
    console.log("Yes, json.WMS_Capabilities.capability.layer exists");



    // START creating info about CRS
    crs = processGetCapabilities.getCRS(json);
    mapinfo.addCrs(crs);
    // END creating info about crs

    // START creating info about layers
    mapinfo.addLayer(processGetCapabilities.getLayerInfo(json, req.fullUrl)); // To be updated zto COLABIS Layer
    // END creating info about layers

    res.send(mapinfo);
    controlExecution.logEnd(req.fullUrl);

});


server.get({
    url: "/services/:id/maps/render",
    swagger: {
        summary: "service entry resource",
        notes: "this resource provides access to a geodata service",
    }
}, function(req, res, next) {
    requestUtils.injectFullUrl(req);
    controlExecution.logStart(req.fullUrl);

    var resultCheckRequestedService = helpingFunctions.checkRequestedService(services, req.params.id, serviceCache);
    if (resultCheckRequestedService) {
        return next(resultCheckRequestedService);
    }

    // checking the parameters of the query and getting the parameters for the request URL
    var resultCheckQuery = helpingFunctions.checkQuery(req.params, services, serviceCache);

    // If an error is in the query, it will be returned by the following:
    for (var key in resultCheckQuery) {
        try {
            if(resultCheckQuery[key].error) {
              res.send(resultCheckQuery[key].error);
            }
        } catch (err) {}
    }



    var requestUrl = helpingFunctions.getRequestURL(resultCheckQuery.layer, resultCheckQuery.bbox,
      resultCheckQuery.crs, resultCheckQuery.width, resultCheckQuery.height,
        serviceCache, services, req.params.id, resultCheckQuery.format);

    // Piping the image
    requesting.get(String(requestUrl)).pipe(res);

});


server.get({
    url: "/services/:id/maps/:layer/render",
    swagger: {
        summary: "service entry resource",
        notes: "this resource provides access to a geodata service",
    }
}, function(req, res, next) {
    requestUtils.injectFullUrl(req);
    controlExecution.logStart(req.fullUrl);


    var resultCheckRequestedService = helpingFunctions.checkRequestedService(services, req.params.id, serviceCache);
    if (resultCheckRequestedService) {
        return next(resultCheckRequestedService);
    }

    // checking the parameters of the query and getting the parameters for the request URL
    var resultCheckQuery = helpingFunctions.checkQuery(req.params, services, serviceCache);
    console.log("Checked query: " + resultCheckQuery);
    // If an error is in the query, it will be returned by the following:
    for (var key in resultCheckQuery) {
        try {
            if(resultCheckQuery[key].error) {
              res.send(resultCheckQuery[key].error);
            }
        } catch (err) {}
    }



    var requestUrl = helpingFunctions.getRequestURL(resultCheckQuery.layer, resultCheckQuery.bbox,
      resultCheckQuery.crs, resultCheckQuery.width, resultCheckQuery.height,
        serviceCache, services, req.params.id, resultCheckQuery.format);
    // Piping the image
    requesting.get(String(requestUrl)).pipe(res);

});



restifySwagger.loadRestifyRoutes();


/**
 * Start server
 */
server.listen(8001, function() {
    console.log("%s started: %s", server.name, server.url);
});


serviceCache.updateServices(services); // Liest beim Serverstart die GetCapabilities und hält sie lokal als JOSN vor .var restify = require("restify");
