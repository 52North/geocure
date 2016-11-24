// External libraries
var restify = require ("restify");
var restifySwagger = require ("node-restify-swagger");
var requesting = require ("request");

// Introducing local libraries
// var services = require("../services/services.json");
// var servicesMetadescription = require("../services/servicesMetadescription.json");
// var serviceCheck = require("./general/serverSetup/servicesCheck");


var server = module.exports.server = restify.createServer ();

server.name = "geocure";

server.use (restify.queryParser ());
server.use (restify.CORS ());
server.use (restify.bodyParser ());

restifySwagger.configure (server, {
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
/*server.get(/\/apidocs\/?.*!/, restify.serveStatic({
 directory: "./documentation",
 default: "index.html"
 }));
 server.get("/", function(req, res, next) {
 res.header("Location", "/apidocs/index.html");
 res.send(302);
 return next(false);
 });*/


/**
 * Services Resource base controller
 */


// Check the configuration of services before startup
//serviceCheck.check(services, servicesMetadescription)


server.get ({
    url: "/services",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to geodata services",
    }
}, function (req, res, next)
{
    /*
     // Information for tracing
     requestUtils.injectFullUrl(req);
     controlExecution.logStart(req.fullUrl);

     res.send(processGetCapabilities.getServicesInfo(services, serviceCache, req));
     controlExecution.logEnd(req.fullUrl);*/

    res.send (serviceCheck.checkServices(services));
});


restifySwagger.loadRestifyRoutes ();


/**
 * Start server
 */
server.listen (8000, function ()
{
    console.log ("%s started: %s", server.name, server.url);
});
