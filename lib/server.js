// External libraries
var restify = require("restify");
var restifySwagger = require("node-restify-swagger");
var error = require("restify-error");
var requesting = require("request");

// Internal libraries
var controlExecution = require("./controlExecution");
var processJSON = require("./processJSON");
var processGetCapabilities = require("./processGetCapabilities");
var serviceRequest = require("./serviceRequest");
var requestUtils = require("./request-utils");

// Service Capabilities
var serviceCache = require("./serviceCache");
var WFSCache = require("./WFSCache");
// Service description
var services = require("../services/services.json"); // Links the file, containing all services

var server = module.exports.server = restify.createServer();


// ERROR-HANDLING: Stops the server if not all keys are given in services.json
controlExecution.serviceConfigurationValid(services);


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

    res.send(processGetCapabilities.getServicesInfo(services, serviceCache, req));
    controlExecution.logEnd(req.fullUrl);
});

// Endpoints for WMS

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

        res.send(processGetCapabilities.getServiceInfo(services, serviceCache, req));
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

    res.send(processGetCapabilities.getMapInfo(services, serviceCache, req));
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

    var errorCheckRequestedService = serviceRequest.checkRequestedService(services, req.params.id, serviceCache);
    if (errorCheckRequestedService) {
        return next(errorCheckRequestedService);
    }


    var requestUrl = serviceRequest.getMapRequestURL(req, serviceCache, services)
    if (requestUrl.error) {
        res.send(requestUrl.error); // Return Errormessage;
    }
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


    var errorCheckRequestedService = serviceRequest.checkRequestedService(services, req.params.id, serviceCache);
    if (errorCheckRequestedService) {
        return next(errorCheckRequestedService);
    }

    var requestUrl = serviceRequest.getMapRequestURL(req, serviceCache, services)
    if (requestUrl.error) {
        res.send(requestUrl.error); // Return Errormessage;
    }
    // Piping the image
    requesting.get(String(requestUrl)).pipe(res);

});



// Endpoints for WFS

server.get({
    url: "/services/:id/features",
    swagger: {
        summary: "service entry resource",
        notes: "this resource provides access to a geodata service",
    }
}, function(req, res, next) {
    requestUtils.injectFullUrl(req);
    controlExecution.logStart(req.fullUrl);


    // If no format (f) is requested, return the general information.
    res.send(processGetCapabilities.getFeatureInfo(services, WFSCache, req));

    controlExecution.logEnd(req.fullUrl);

});

server.get({
    url: "/services/:id/features/:features/data",
    swagger: {
        summary: "service entry resource",
        notes: "this resource provides access to a geodata service",
    }
}, function(req, res, next) {
    requestUtils.injectFullUrl(req);
    controlExecution.logStart(req.fullUrl);

    var requestURL = serviceRequest.getFeatureRequestURL(req, WFSCache, services);
    console.log("REQUESTURL " + requestURL);
    requestURL.message ? res.send(requestURL) : requesting.get(String(requestURL)).pipe(res);


    controlExecution.logEnd(req.fullUrl);

});





restifySwagger.loadRestifyRoutes();


/**
 * Start server
 */
server.listen(8001, function() {
    console.log("%s started: %s", server.name, server.url);
});

serviceCache.updateServices(services);
WFSCache.updateServices(services);
