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

const BASE_URL = "/geocure";

server.name = "geocure";

server.use(restify.gzipResponse());
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.bodyParser());

server.use(function (req, res, next) {
    url.injectFullUrl(req);
    next();
});

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
 * Services Resource base controller
 */
server.get({
    url: BASE_URL + "/services",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to geodata services",
    }
}, function (req, res, next) {

    try {
        const response = wmsServices.getAllServices(services, req);
        if (response.exceptions) {
            typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
        } else {
            res.send(200, response);
        }

    } catch (error) {
        res.send(500, error);
    }
});


server.get({
    url: BASE_URL + "/services/:id",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to a service by id",
    }
}, function (req, res, next) {
    try {
        const response = wmsServices.getServiceDescriptionById(services, req);
        if (response.exceptions) {
            typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
        } else {
            res.send(200, response);
        }
    } catch (error) {
        res.send(500, error);
    }
});

//server.get({
//    url: BASE_URL + "/services/:id/map/styles",
//    swagger: {
//        summary: "service resource",
//        notes: "this resource provides access to a style ressource"
//    }
//}, function (req, res, next) {
//    try {
//        // access styles
//        res.send(200, res);
//    } catch (error) {
//        res.send(500, error);
//    }
//});

server.get({
    url: BASE_URL + "/services/:id/map",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to a layer overview"
    }
}, function (req, res, next) {
    try {
        const response = maps.describeMap(cacheLoaderWMS.getCache(), req, services);
        if (response.exceptions) {
            typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
        } else {
            res.send(200, response);
        }
    } catch (error) {
        res.send(500, error);
    }
});


server.get({
    url: BASE_URL + "/services/:id/map/info",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to layers"
    }
}, function (req, res, next) {
    try {
      const getFeatureInfoUrl = requestURLWMS.getFeatureInfo(cacheLoaderWMS, req, services);
        // console.log(getFeatureInfoUrl);
        if (getFeatureInfoUrl.exceptions) {
            typeof getFeatureInfoUrl.statuscode === "number" ? res.send(getFeatureInfoUrl.statuscode, getFeatureInfoUrl) : res.send(500, getFeatureInfoUrl);
        } else {
            requesting.get(String(getFeatureInfoUrl)).on('response', response => {
                if (!response.headers["content-disposition"]) {
                    response.statusCode = 900;
                }
            }).pipe(res);
        }
    } catch (error) {
        res.send(500, error);
    }
});


server.get({
    url: BASE_URL + "/services/:id/map/render",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to layers",
    }
}, function (req, res, next) {
    try {
        const getMapUrl = requestURLWMS.getMapURL(cacheLoaderWMS, req, services);
        //console.log(getMapUrl);
        if (getMapUrl.exceptions) {
            typeof getMapUrl.statuscode === "number" ? res.send(getMapUrl.statuscode, getMapUrl) : res.send(500, getMapUrl);
        } else {
            console.log("getMapUrl = " + getMapUrl);
            var xmlObj = requestURLWMS.getMapXML(cacheLoaderWMS, req, services);
            console.log("xmlObj = " + xmlObj);
            requesting.post({
                url: String(getMapUrl),
                headers: {
                    "content-type": "text/xml"
                },
                body: xmlObj
            })
                    .on('response', response => {
                        if (response.getContentType() === "application/json") {
                            response.statusCode = 900;
                        }
                    })
                    .on('error', err => {
                        console.log(err);
                    })
                    .pipe(res);
        }

    } catch (error) {
        res.send(404, error);
    }
});


server.get({
    url: BASE_URL + "/services/:id/features",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to features",
    }
}, function (req, res, next) {
    try {
        const response = features.describeFeatures(cacheLoaderWFS.getCache(), req, services);
        if (response.exceptions) {
            typeof response.statuscode === "number" ? res.send(response.statuscode, response) : res.send(500, response);
        } else {
            res.send(200, response);
        }
    } catch (error) {

        res.send(500, error);
    }
});



server.get({
    url: BASE_URL + "/services/:id/features/:featureId/data",
    swagger: {
        summary: "services resource",
        notes: "this resource provides access to the data of a feature"
    }
}, function (req, res, next) {
    try {
        const getFeatureRequestURL = requestURLWFS.getFeature(cacheLoaderWFS, req, services);
        // console.log(getFeatureRequestURL);
        if (getFeatureRequestURL.exceptions) {
            typeof getFeatureRequestURL.statuscode === "number" ? res.send(getFeatureRequestURL.statuscode, getFeatureRequestURL) : res.send(500, getFeatureRequestURL);
        } else {
            requesting.get(String(getFeatureRequestURL)).on('response', response => {
                if (!response.headers["content-disposition"]) {
                    response.statusCode = 900;
                }
            }).pipe(res);
        }
    } catch (error) {
        res.send(500, error);
    }
});




restifySwagger.loadRestifyRoutes();


/**
 * Start server
 */


cacheLoaderWMS.loadCache().then(() => cacheLoaderWFS.loadCache()).then(() => {
    server.listen(8002, function () {
        console.log("%s started: %s", server.name, server.url);
    });
})
