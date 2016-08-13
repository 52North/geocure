var fs = require("fs");
var requestUtils = require("./request-utils");
var errorMessages = require("./errorMessages");
var error = require("restify-error");
// Functions serve to keep track of the Requrst in the Terminal .

function logStart(URL) {
    console.log("++++++++++++++ START -> " + URL + " +++++++++++++++++");
}

function logEnd(URL) {
    console.log("++++++++++++++++ END -> " + URL + " +++++++++++++++++");
}




//############################################################################################################################
// Signatur: verifyObjectId : json objectID -> Object
// Description: Consumes a JSON (json) and a string (objectID) and returns an Object which attributes represent the result.
// result[0] contains a BOOLEAN which indicates whether the id was found in the json.
// result[1] contains the object, with the id or NULL.


function getKeyValueObject(json, key, value) {
    console.log("At function getKeyValueObject()");
    var result = {
        keyFound: false,
        object: null
    };

    for (var i = 0; i < json.length; i++) {
        if (key in json[i]) {
            if (json[i][key] == value) {
                result.keyFound = true;
                result.object = json[i];
                i = json.length; // found object, so no further iteration required.
            }
        }
    }
    console.log("Finishing function getKeyValueObject()");
    return result;
}




// Signatur: unmarshallXML : url callback ->
// Description: Takes the url to an XML (for instance GetCapabilities) and creates a JSON from it. A callback-function is then executed on the JSON.

// Dependencies for XML-Parsing
var Jsonix = require("jsonix").Jsonix;
// Check whether all needed!
var XLink_1_0 = require("w3c-schemas").XLink_1_0;
var WMS_1_1_1 = require("ogc-schemas").WMS_1_1_1;
var OWS_1_1_0 = require("ogc-schemas").OWS_1_1_0;
var WPS_1_0_0 = require("ogc-schemas").WPS_1_0_0;
var WMS_1_3_0 = require("ogc-schemas").WMS_1_3_0;
// ENDE Denpendencies for XML-Parsion

function unmarshallXML(url, callback) {
    console.log("At function unmarshallXML()");
    var getCapabilitiesUrl = url;
    var context = new Jsonix.Context([XLink_1_0, WMS_1_3_0], {
        namespacePrefixes: {
            "http://www.opengis.net/wms": "",
            "http://www.w3.org/1999/xlink": "xlink"
        },
        mappingStyle: "simplified"
    });

    var unmarshaller = context.createUnmarshaller();
    unmarshaller.unmarshalURL(getCapabilitiesUrl, function(result) {
        console.log("Finishing function unmarshallXML()");
        callback(result);
    });
}


// Signatur: getGetCapabilitiesURL : JSON, service, callback ->
// Description: Takes an Json-Document with a certain JSON-structure and konstructs the getCapabiltiesURL for a certain value (service) of an id.

function getGetCapabilitiesURL(json, service) {
    console.log("At function getCapabilitiesUrl()");
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    var getCapabilitiesUrl = checkedRequest.object.baseURLService + "wms?request=GetCapabilities&service=wms";
    console.log("Finishing getCapabilitiesUrl()");
    return getCapabilitiesUrl;
}


// Signatur: getBaseURL : JSON, service -> String
// Description: Takes an Json-Document with a certain JSON-structure and returns the baseURL
function getBaseURL(json, service) {
    console.log("At getBaseURL()");
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    // Check checkedRequest! Fehlerbehandlung!
    var getBaseURL = checkedRequest.object.baseURLService;
    console.log("Finishing getBaseURL()");
    return getBaseURL;
}



// Signature
// Description
function getCrsInfoSimple(Layer) {
    console.log("At getCrsInfoSimple()");
    //console.log(Layer);
    var response = null;
    if ("boundingBox" in Layer) {
        response = [];
        response = Layer.boundingBox;
        if (response[0].crs === "CRS:84") {
            response[0].crs = "EPSG:4326";
        }
    }
    console.log("Finishing getCrsInfoSimple()");
    return response;
}

//Signatur: getCrs: json -> String
//Description: Takes a json-representation of getCapabilities and returns
// the difined CRS.
function getCrs(getCapabilities) {
    console.log("At getCRS()");
    var layer = getCapabilities.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
    var refInfo = getCrsInfoSimple(layer);
    var result = null;

    if (refInfo[0].crs === "CRS:84") {
        result = "EPSG:4326"
    } else {
        result = refInfo[0].crs
    }
    console.log("Finishing getCrs()");
    return result;
}



// Signatur: getLayerInfo : Layer, RequestURL -> JSON-Object
// Description: Takes the "Layer-section"- of an WMS-GetCapabilities 1.3.0 -Document and returns crs-information for a given crs.
function getLayerInfo(Layer, RequestURL) {
    console.log("At getLayerInfo()");
    var layersObject = {}; // Object to be filled

    if ("name" in Layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        res.send("name gefunden"); // TO Do:  Implemenetation of something useful!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } else {
        for (var i = 0; i < Layer.layer.length; i++) {
            var key = Layer.layer[i].name;
            layersObject[key] = RequestURL + '/' + key + "/render";
        }
    }
    console.log("Finishing getLayerInfo()");
    return layersObject;
}


// Signatur: getAllLayersRequest : Layer -> String
// Description: Takes the layer-section of get-capabilities and returns all layers.
function getAllLayersRequest(layer) {
    console.log("At getAllLayersRequest()");
    var result = "";
    var keys = [];
    if ("name" in layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        return ("name gefunden"); // TO Do:  Implemenetation of something useful
    } else {
        for (var i = 0; i < layer.layer.length; i++) {
            var key = layer.layer[i].name;
            console.log(key);
            // result = result + JSON.stringify(key);

            result = result + "," + key;
        }
    }
    console.log("Finishing getAllLayersRequest()");
    return result.substring(1, result.length); // substring is jused to temove last ":"
}



// Signature
// Description
function getGlobalBBOX(json) {
    console.log("At getGlobalBBOX()");
    // Needed to access the minx,miny, maxx, maxy for bbox and get CRS-Info
    var layer = json.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
    var refInfo = getCrsInfoSimple(layer);
    var result = null;
    if (refInfo.length > 0) {
        result = refInfo[0].miny + "," + refInfo[0].minx + "," + refInfo[0].maxy + "," + refInfo[0].maxx
    }
    console.log("Finishing getGlobalBBOX()");
    return result
}



//Signatur: checkCrs: String : BOOLEAN
//Description: Checks whether a given CRS is supported by the services
function checkCrs(crs) {
    console.log("At checkCrs()"); // Implementation has to be done! Look into the json-GetCapabilities for the structure and than check for crs.
    return true;
}

// Signature
// Description
function checkServices(services) {
    console.log("At function checkServices()");
    var result = true;
    services.forEach(function(entry) {
        if (!("id" in entry)) {
            console.log("The key 'id' is missing");
            result = false;
        }
        if (!("href" in entry)) {
            console.log("The key 'href' is missing");
            result = false;
        }
        if (!("baseURLService" in entry)) {
            console.log("The key 'baseURLService' is missing");
            result = false;
        }
    })
    console.log("Finishing checkServices");
    return result;
}


function checkBbox(params, serviceCache) {
    // Valid format? We only want to use numbers
    if (isNaN(params.minx)) {
        var message = new error.BadRequestError("minx is not a number");
        return {
            "error": message
        };
    }

    if (isNaN(params.miny)) {
        var message = new error.BadRequestError("miny is not a number");
        return {
            "error": message
        };
    }

    if (isNaN(params.maxx)) {
        var message = new error.BadRequestError("maxx is not a number");
        return {
            "error": message
        };
    }

    if (isNaN(params.maxy)) {
        var message = new error.BadRequestError("maxy is not a number");
        return {
            "error": message
        };
    }

    // logically correct?
    if (Number(params.minx) >= Number(params.maxx)) {
        var message = new error.BadRequestError("minx must be greater than maxx");
        return {
            "error": message
        };
    }

    if (Number(params.miny) >= Number(params.maxy)) {
        var message = new error.BadRequestError("miny must be greater than maxy");
        return {
            "error": message
        };
    }

    // in the context of the offered layer correct?
    var extendNotOK = checkExtent(params, serviceCache);

    return extendNotOK;

}

// Description: returns true, if extent is ok. returns false if it is not ok.
function checkExtent(params, serviceCache) {
    var crsAndCoordinatesOfMaxExtent = getCrsInfoSimple(serviceCache.getServices()[params.id].WMS_Capabilities.capability.layer);
    var requestedCrs = null
    var currentCrs = crsAndCoordinatesOfMaxExtent[0].crs;
    var givenCoordinates = {"minx" : params.minx, "miny" : params.miny, "maxx" : params.maxx,  "maxy" : params.maxy};
    var maxExtent = {"minx" : crsAndCoordinatesOfMaxExtent[0].minx, "miny" : crsAndCoordinatesOfMaxExtent[0].miny, "maxx" : crsAndCoordinatesOfMaxExtent[0].maxx, "maxy" : crsAndCoordinatesOfMaxExtent[0].maxy};
    if (params.crs) {
        requestedCrs = params.crs // Validity checked in checkQuery().
        return "calculations have to be done";
    }

    for (var i = 0; i < maxExtent.length; i++) {
        if (maxExtent.minx > givenCoordinates.minx || maxExtent.miny > givenCoordinates.miny || maxExtent.maxx < givenCoordinates.maxx || maxExtent.maxy < givenCoordinates.maxy) {
          var message = new error.BadRequestError("The requested coordinates are not in the extent of the globale bbox: " + maxExtent);
          return {
              "error": message
          };
        }
    }

    return givenCoordinates;
}





function getRequestURL(layer, bbox, crs, width, height, serviceCache, services, id, format) {
    console.log("At function getRequestURL");
    var allLayers = false;

    var ServiceGetCapabilities = serviceCache.getServices()[id];

    var bbox = checkedBbox(bbox); // Changed to checkBbox!
    console.log("checked bbox is: " + bbox);

    if (!layer) {
        layer = getAllLayersRequest(ServiceGetCapabilities.WMS_Capabilities.capability.layer);
    }
    if (!bbox) {
        bbox = getGlobalBBOX(ServiceGetCapabilities);
        console.log("bbox is: " + bbox);
    }
    if (!crs) {
        crs = getCrs(ServiceGetCapabilities);
        console.log("crs is: " + crs);
    } else {
        checkCrs(crs);
    }
    if (!width) {
        width = services[0].defaultWidth;
    }
    if (!height) {
        console.log("Get default height")
        height = services[0].defaultHeight;
        console.log("Default height is: " + height);
    }

    if (!format) {
        format = services[0].defaultFormat;
        console.log("Default format is: " + format);

    }


    var baseURL = getBaseURL(services, id) + "wms?";
    var service = "service=wms";
    var version = "version=" + ServiceGetCapabilities.WMS_Capabilities.version;
    var request = "request=GetMap";
    console.log("bbox is: " + bbox);
    var requestURL = baseURL + service + "&" + version + "&" + request + "&" + "layers=" + layer + "&" + "bbox=" + bbox + "&" + "crs=" + crs + "&" + "width=" + width + "&" + "height=" + height + "&" + "format=" + format;
    console.log("Constructed URL in getRequestURL");
    console.log(requestURL);
    return requestURL;
}


function checkRequestedService(services, id, serviceCache, crs) {

    var ServiceGetCapabilities = serviceCache.getServices()[id];

    if (!ServiceGetCapabilities) {
        var message = new error.InternalServerError("The requested service is not offered");
        return message;
    }

    if (!ServiceGetCapabilities.WMS_Capabilities) {
        var message = new error.InternalServerError("The wms-capabilities are currently not available. Please try again later.");
        return message;
    }

    if (!ServiceGetCapabilities.WMS_Capabilities.version) {
        var message = new errorInternalServerError("The version of the wms-service is not accessible.");
        return message;
    }


    if (!getAllLayersRequest(ServiceGetCapabilities.WMS_Capabilities.capability.layer)) {
        var message = new error.InternalServerError("Layer can not be found");
        return message;
    }

    return false;

}




function checkQuery(params, services, serviceChache) {


    //Parameters needed for construction of the request URL
    // By returning this, it can be decided later how tor react on not valid query content
    var requestParams = {
        "layer": null,
        "bbox": null,
        "crs": null,
        "width": null,
        "height": null,
        "format": null
    }

    if (params.layer) { // Are specific layers requested? If not, All Layers will be requested later in getRequestURL
        var notValid = checkLayers(serviceCache, params.id, params.layer); // Are they valid?
        if (notValid) {
            var message = new error.BadRequestError("At least one requested layer is not valid");
            requestParams.layer = {
                "error": message
            };
        }

    }

    if (params.crs) { // User oassed crs
        // Is it supported?
        var crsSupported = checkCrs(serviceChache, params.id, params.crs);
        if (crsSupported) {
            requestParams.crs = params.crs;
        } else {
            var message = new error.BadRequestError("The requested CRS is not supported for all layers");
            requestParams.crs = {
                "error": message
            };
        }
    }


    if (params.minx || params.miny || params.maxx || params.maxy) { // Are elements of a bbox requested?
        if (params.minx && params.miny && params.maxx && params.maxy) { // Are they complete?
            requestParams.bbox = checkBbox(params, serviceChache) // Is the given bbox valid?
        } else {
            var message = new error.BadRequestError("Not all parameters (minx, miny, maxx, maxy) given for the bbox");
            requestParams.bbox = {
                "error": message
            };
        }
    }

    if (params.width) {
        if (!isNaN(params.width) && Number(params.width > 0)) {
            requestParams.width = params.width;
        } else {
            var message = new error.BadRequestError("width must be a number greater than zero");
            requestParams.width = {
                "error": message
            };
        }
    }

    if (params.height) {
        if (!isNaN(params.height) && Number(params.height > 0)) {
            requestParams.height = params.height;
        } else {
            var message = new error.BadRequestError("height must be a number greater than zero");
            requestParams.height = {
                "error": message
            };
        }
    }


    // Fomat currently not supported


    return requestParams;
}

// Description: Checks whether the requested layers are valid
function checkLayers(serviceCache, id, layer) {
    var serviceGetCapabilities = serviceCache.getServices()[id];
    console.log("1");
    var storedLayer = serviceGetCapabilities.WMS_Capabilities.capability.layer;
    console.log("2");
    var validLayers = [];

    if ("name" in storedLayer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        res.send("name gefunden"); // TO Do:  Implemenetation of something useful!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } else {
        for (var i = 0; i < storedLayer.layer.length; i++) {
            validLayers.push(String(storedLayer.layer[i].name));
        }
    }

    console.log("validLayers: " + validLayers);

    console.log("layer: " + layer);
    var requestLayerArray = layer.split(",");
    console.log("Splitted layers: ");
    console.log(requestLayerArray);

    var notValid = false;

    for (var i = 0; i < requestLayerArray.length; i++) {
        var validRequest = false;
        for (var j = 0; j < validLayers.length; j++) {
            if (requestLayerArray[i] == validLayers[j]) {
                validRequest = true;
            }
        }
        if (!validRequest) {
            notValid = true;
        }
    }
    console.log("ErrorValue: " + notValid);
    return notValid;
}


// Description: Is crs for the layer available?
function checkCrsForLayer(layer, crs) {
    var result = false;
    for (var i = 0; i < layer.crs.length; i++) {
        console.log("layer.crs[i]: " + layer.crs[i]);
        if (layer.crs[i] === crs) {
            result = true;
            break;
        }
    }
    return result;
}

function checkCrsLayers(layers, crs) {
    var result = false;

    for (var i = 0; i < layers.length; i++) {
        console.log("layery.length: " + layers.length);
        console.log("lacyer: " + layers[i]);
        var b = checkCrsForLayer(layers[i], crs);
        console.log("Restult b = " + b);
        if (b) {
            result = true;
        } else {
            result = false;
            break;
        }
    }
    console.log("Result von chrckCrsLayers: " + result);
    return result;
}


// Description: id is layer id
function checkCrs(serviceCache, id, crs) {
    console.log("checkCrs");
    console.log("id is: " + id);
    var layers = String(id).split(",");

    console.log("layers nach split: " + layers);
    console.log("layers.length= " + layers.length);
    var layerInfo = [];
    for (var i = 0; i < layers.length; i++) {
        //console.log("Cache is: " + serviceCache.getServices()[id]);
        console.log(serviceCache.getServices()[layers[i]].WMS_Capabilities.capability.layer);
        layerInfo.push(serviceCache.getServices()[layers[i]].WMS_Capabilities.capability.layer);
    }


    var result = checkCrsLayers(layerInfo, crs);
    return result;

}

function checkParameter(serviceCache, layer, bbox, crs, width, height, format, id) {

}

module.exports = {
    logStart: logStart,
    logEnd: logEnd,
    getKeyValueObject: getKeyValueObject,
    getGetCapabilitiesURL: getGetCapabilitiesURL,
    unmarshallXML: unmarshallXML,
    getCrsInfoSimple: getCrsInfoSimple,
    getLayerInfo: getLayerInfo,
    getBaseURL: getBaseURL,
    getAllLayersRequest: getAllLayersRequest,
    ggetGlobalBBOX: getGlobalBBOX,
    checkServices: checkServices,
    getRequestURL: getRequestURL,
    checkRequestedService: checkRequestedService,
    checkParameter: checkParameter,
    checkLayers: checkLayers,
    checkQuery: checkQuery

}
