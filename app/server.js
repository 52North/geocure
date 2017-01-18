// External libraries
const restify = require("restify");
const restifySwagger = require("node-restify-swagger");
const requesting = require("request");
const errors = require("restify-errors");

// Local libraries
const services = require("./config/services.json");
const wmsServices = require("./wms/wmsServices.js");
const url = require("./general/url.js");
const maps = require("./wms/maps.js");
const features = require("./wfs/features.js");
const requestURLWMS = require("./wms/requestsURL.js");
const requestURLWFS = require("./wfs/requestsURL.js");
// Chaches
const cacheLoaderWFS = require("./wfs/cacheLoader.js");
const cacheLoaderWMS = require("./wms/cacheLoader.js");

const server = module.exports.server = restify.createServer();

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


/**
 * TODO: ERRORHANDLING:
 * TODO: FÜR ERRORHANDLING: FEHLER FOM GEOSERVER WEITER DRUCHREICHEN. ANDERE FEHLER SELBER HANDHABEN!
 */

server.get({
        url: "/services",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to geodata services",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        /*
         // Information for tracing
         requestUtils.injectFullUrl(req);
         controlExecution.logStart(req.fullUrl);

         res.send(processGetCapabilities.getServicesInfo(services, serviceCache, req));
         controlExecution.logEnd(req.fullUrl);*/
        try {
                const response = wmsServices.getAllServices(services, req);
                if(response.exceptions){
                  typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
                }
                else {
                  res.send(200, response);
                }

        } catch (error) {
                res.send(500, error);
        }
});


server.get({
        url: "/services/:id",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to a service by id",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        try {
          const response = wmsServices.getServiceDescriptionById(services, req);
          if(response.exceptions){
            typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
          }
          else {
            res.send(200, response);
          }
        } catch (error) {

            res.send(500, error);
        }
});


server.get({
        url: "/services/:id/maps",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to a layer overview",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        try {
                const response = maps.describeMap(cacheLoaderWMS.getCache(), req)
                if(response.exceptions){
                  typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
                }
                else {
                  res.send(200, response);
                }
              } catch (error) {

                  res.send(500, error);
              }
});

server.get({
        url: "/services/:id/maps/render",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to layers",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        try {
                const getMapUrl = requestURLWMS.getMapURL(cacheLoaderWMS, req, services);
                if(getMapUrl.exceptions){
                  typeof getMapUrl.statuscode === "number" ? res.send(getMapUrl.statuscode, getMapUrl) : res.send(500, getMapUrl);
                }
                else {
                  requesting.get(String(getMapUrl)).on('response', response => {
                    if(response.getContentType() === "application/json"){
                      response.statusCode = 900;
                    }
                  }).pipe(res);
                }

        } catch (error) {
                res.send(500, error);
        }
});


server.get({
        url: "/services/:id/features",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to features",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        try {
                const response = features.describeFeatures(cacheLoaderWFS.getCache(), req);
                if(response.exceptions){
                  typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
                }
                else {
                  res.send(200, response);
                }
              } catch (error) {

                  res.send(500, error);
              }
});



server.get({
        url: "/services/:id/features/:featureId/data",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to the data of a feature",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        try {
                const getFeatureRequestURL = requestURLWFS.getFeature(cacheLoaderWFS, req, services);
                if(getFeatureRequestURL.exceptions){
                  typeof getFeatureRequestURL.statuscode === "number" ? res.send(getFeatureRequestURL.statuscode, getFeatureRequestURL) : res.send(500, getFeatureRequestURL);
                }
                else {
                  requesting.get(String(getFeatureRequestURL)).on('response', response => {
                    if(!response.headers["content-disposition"]){
                      response.statusCode = 900;
                    }
                  }).pipe(res);
                }
        } catch (error) {
            res.send(500, error);
                  }
});



// const getMapUrl = requestURLWMS.getMapURL(cacheLoaderWMS, req, services);
// if(getMapUrl.exceptions){
//   typeof getMapUrl.statuscode === "number" ? res.send(getMapUrl.statuscode, getMapUrl) : res.send(500, getMapUrl);
// }
// else {
//   requesting.get(String(getMapUrl)).on('response', response => {
//     if(response.getContentType() === "application/json"){
//       response.statusCode = 900;
//     }
//   }).pipe(res);
// }




/**
 * TESTS
 */

server.get({
        url: "/loadCacheWFS",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access maps",
        }
}, function(req, res, next) {
          cacheLoaderWFS.loadCache();
          res.send("loading cache");
});




server.get({
        url: "/getCacheWFS",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access maps",
        }
}, function(req, res, next) {

          res.send(cacheLoaderWFS.getCache());
});


server.get({
        url: "/loadCacheWMS",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access maps",
        }
}, function(req, res, next) {
          cacheLoaderWMS.loadCache();
          res.send("loading cache");
});




server.get({
        url: "/getCacheWMS",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access maps",
        }
}, function(req, res, next) {

          res.send(cacheLoaderWMS.getCache());
});



restifySwagger.loadRestifyRoutes();


/**
 * Start server
 */


cacheLoaderWMS.loadCache().then(() => cacheLoaderWFS.loadCache()).then(() => {
  server.listen(8002, function() {
          console.log("%s started: %s", server.name, server.url);
  });
})
