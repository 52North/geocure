var restify = require('restify');
var restifySwagger = require('node-restify-swagger');
var requestUtils = require('./request-utils');
var request = require("request");
var helpingFunctions = require("./helpingFunctions");
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

  // Signatur: createMapInfo : JSON -> JSON
  // Description: Takes the GetCapabilities of an OGC-WMS and returns a JSON-Representation with specified content.
  function createMapInfo(json){

        // Specification of the output if createMapInfo
        function mapInfoTemplate() {
            this.layers = [];
            this.crs = [];
            this.addLayer = function(layerObject) {
                this.layers.push(layerObject);
            }
            this.addCrs = function(crsInfo){
              this.crs = crsInfo;
            }
        }

        var mapinfo = new mapInfoTemplate(); // Need it to fill it in the following lines with information
        var Layer = json.WMT_MS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json

        // START creating info about CRS
        var crsInfo = {}; // Object to be filled
        crsInfo["name"] = "EPSG:4326" // remove hardcoding?
        crsInfo["bbox"] = {
          "minx" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.minx,
          "miny" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.miny,
          "maxx" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.maxx,
          "maxy" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.maxy,
        }
        var crs = []; crs[0] = crsInfo;
        mapinfo.addCrs(crs);
        // END creating info about crs

        // START creating info about layers
        if ("name" in Layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
            res.send("name gefunden"); // TO Do:  Implemenetation of something useful
        }
        else {
            var layers = [];
            var layersObject = {};
            for (var i = 0; i < json.WMT_MS_Capabilities.capability.layer.layer.length; i++) {
                var key = json.WMT_MS_Capabilities.capability.layer.layer[i].name;
                requestUtils.injectFullUrl(req);
                var value = req.fullUrl + '/' + key;
                layersObject[key] = value;
            }
        }
        layers[0] = layersObject;
        mapinfo.addLayer(layers);
        // END creating info about layers

        res.send(mapinfo);
    }

    helpingFunctions.unmarshallXML(url, createMapInfo);

});



server.get({
    url: '/servicestest',
    swagger: {
        summary: 'service entry resource',
        notes: 'this resource provides access to a geodata service',
    }
}, function(req, res, next) {

    var url = helpingFunctions.getGetCapabilitiesURL(services, "COLABIS_REST_TEST");

//#####################################################################################
    function createMapsInfo(json) {


        function mapinfo() {
            this.layers = [];
            this.crs = [];
            this.addLayer = function(layerObject) {
                this.layers.push(layerObject);
            }
            this.addCrs = function(crsInfo){
              this.crs = crsInfo;
            }
        }

        var mapinfo = new mapinfo();
        // Accessing the layer-section of the GetCapabilitie-Json
        var Layer = json.WMT_MS_Capabilities.capability.layer;
        var crsInfo = {};
        crsInfo["name"] = "EPSG:4326" // HardCoding auflösen
        crsInfo["bbox"] = {
          "minx" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.minx,
          "miny" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.miny,
          "maxx" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.maxx,
          "maxy" : json.WMT_MS_Capabilities.capability.layer.latLonBoundingBox.maxy,
        }
        var crs = []; crs[0] = crsInfo;
        mapinfo.addCrs(crs);

        if ("name" in Layer) { // Wenn TRUE, dann gibt es nur diesen einen Layer und KEINE im Array folgenden.
            res.send("name gefunden");
        } else {
            var layers = [];
            var layersObject = {};
            for (var i = 0; i < json.WMT_MS_Capabilities.capability.layer.layer.length; i++) {
                var key = json.WMT_MS_Capabilities.capability.layer.layer[i].name;
                requestUtils.injectFullUrl(req);
                var value = req.fullUrl + '/' + key;
                layersObject[key] = value;
            }
        }
        layers[0] = layersObject;
        mapinfo.addLayer(layers);
        res.send(mapinfo);
    }

    helpingFunctions.unmarshallXML(url, createMapsInfo);
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

//serviceCache.updateServices(); // Liest beim Serverstart die GetCapabilities und hält sie lokal als JOSN vor .
