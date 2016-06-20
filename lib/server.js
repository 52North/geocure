var restify = require('restify');
var restifySwagger = require('node-restify-swagger');
var requestUtils = require('./request-utils');
var request = require("request");
var helpingFunctions = require("./helpingFunctions");
var serviceCache = require("./serviceCache");
var xml2js = require('xml2js'); // Dependencie! ? or delete if not used!
var fs = require("fs");
//var serviceCache = require("serviceCache"); Import if it is imoplemented



var server = module.exports.server = restify.createServer();

server.name = 'geocure';


var services = require('../services/services.json'); // Links the file, containing all services


server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.bodyParser());

restifySwagger.configure(server, {
    info: {
        title: '52°North geocure API',
        description: '52°North geocure API',
        contact: 'm.rieke@52north.org',
        license: 'MIT',
        licenseUrl: 'http://opensource.org/licenses/MIT'
    },
    apiDescriptions: {
        'get': 'GET API',
        'post': 'POST API for complex requests'
    }
});

/**
 * API Docs contents
 * see http://mcavage.me/node-restify/#serve-static for usage
 **/
server.get(/\/apidocs\/?.*/, restify.serveStatic({
    directory: './documentation',
    default: 'index.html'
}));
server.get('/', function(req, res, next) {
    res.header('Location', '/apidocs/index.html');
    res.send(302);
    return next(false);
});

/**
 * Services Resource base controller
 */
server.get({
    url: '/services',
    swagger: {
        summary: 'services resource',
        notes: 'this resource provides access to geodata services',
    }
}, function(req, res, next) {
    var output = new Array();

    // Object type for the overview of a single service
    function ServiceOverview(id, label, description, href) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.href = href;
    }

    // By constructing the output. Way to avoid redudant information about services in different files.
    for (var i = 0; i < services.length; i++) {
        var obj = services[i];
        var aService = new ServiceOverview(obj.id, obj.label, obj.description, obj.href);
        output.push(aService);
    }

    res.send(output);
});

/**
 * Service entry Resource base controller
 */
server.get({
        url: '/services/:id',
        swagger: {
            summary: 'service entry resource',
            notes: 'this resource provides access to a geodata service',
        }
    },

    function(req, res, next) {
        function ServiceInformation(id, label, description, href, capabilities) {
            this.id = id;
            this.label = label;
            this.description = description;
            this.href = href;
            this.capabilities = capabilities;
        }

        var checkedRequest = helpingFunctions.getKeyValueObject(services, "id", req.params.id);
        if (checkedRequest.keyFound) {
            res.send(new ServiceInformation(checkedRequest.object.id, checkedRequest.object.label, checkedRequest.object.description, checkedRequest.object.href, checkedRequest.object.capabilities));
        }

        res.send("The requestet id -" + req.params.id + "- does not exist."); // Wie sinnvoll? JSON-response?
    });



server.get({
    url: '/services/:id/maps',
    swagger: {
        summary: 'service entry resource',
        notes: 'this resource provides access to a geodata service',
    }
}, function(req, res, next) {

    var url = helpingFunctions.getGetCapabilitiesURL(services, req.params.id);
    // Specification of the output if createMapInfo
    var json = serviceCache.getServices()[req.params.id]; // Get JSON-GetCapabilities to requestet

    if (!json) {
        res.send("Error no json");
        return;
    }

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
    var Layer = json.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json


    // START creating info about CRS
    crs = helpingFunctions.getCrsInfoSimple(Layer);
    mapinfo.addCrs(crs);
    // END creating info about crs

    // START creating info about layers
    requestUtils.injectFullUrl(req);
    var RequestURL = req.fullUrl;
    mapinfo.addLayer(helpingFunctions.getLayerInfo(Layer, RequestURL));  // To be updated zto COLABIS Layer
    // END creating info about layers

    res.send(mapinfo);
});



// NEED TO BE UPDATED REGARDING SPEC!
// server.get({
//     url: '/services/:id/features',
//     swagger: {
//         summary: 'service entry resource',
//         notes: 'this resource provides access to a geodata service',
//     }
// }, function(req, res, next) {
//     var checkedRequest = helpingFunctions.verifyObjectId(services, req.params.id);
//
//     if (checkedRequest.idFound) {
//         if ("features" in checkedRequest.object.capabilities[0]) {
//             request.get(checkedRequest.object.capabilities[0].features).pipe(res);
//         }
//     }
// });


restifySwagger.loadRestifyRoutes();

/**
 * Start server
 */
server.listen(8001, function() {
    console.log('%s started: %s', server.name, server.url);
});

serviceCache.updateServices(); // Liest beim Serverstart die GetCapabilities und hält sie lokal als JOSN vor .var restify = require('restify');
