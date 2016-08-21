var fs = require("fs");
var requestUtils = require("./request-utils");
var errorMessages = require("./errorMessages");
var error = require("restify-error");
// Functions serve to keep track of the Requrst in the Terminal .
var proj4 = require("proj4");

// Own libraries
var processJSON = require("./processJSON");
var processGetCapabilities = require("./processGetCapabilities");




//Signatur: getCrs: json -> String
//Description: Takes a json-representation of getCapabilities and returns
// the difined CRS.
function getCrs(getCapabilities) {
    console.log("At getCRS()");
    var refInfo = processGetCapabilities.getCRS(getCapabilities);
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
    var refInfo = processGetCapabilities.getCRS(json);
    var result = null;
    if (refInfo.length > 0) {
        result = refInfo[0].miny + "," + refInfo[0].minx + "," + refInfo[0].maxy + "," + refInfo[0].maxx
    }
    console.log("Finishing getGlobalBBOX()");
    return result
}



// //Signatur: checkCrs: String : BOOLEAN
// //Description: Checks whether a given CRS is supported by the services
// function checkCrs(crs) {
//     console.log("At checkCrs()"); // Implementation has to be done! Look into the json-GetCapabilities for the structure and than check for crs.
//     return true;
// }

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
        var message = new error.BadRequestError("minx must be smaller than maxx");
        return {
            "error": message
        };
    }

    if (Number(params.miny) >= Number(params.maxy)) {
        var message = new error.BadRequestError("miny must be smaller than maxy");
        return {
            "error": message
        };
    }

    // in the context of the offered layer correct?
    var checkResult = checkExtent(params, serviceCache);

    if (checkResult.ok) { // If checkResult is ok (true)
        return checkResult.bbox;
    }

    return checkResult.error;

}

// Description: retuns {"ok": true, "bbox" : bbox} if ok. returns {"ok": false, error : error}
function checkExtent(params, serviceCache) {
    var crsAndCoordinatesOfMaxExtent = processGetCapabilities.getCRS(serviceCache.getServices()[params.id]);
    var requestedCrs = null
    var currentCrs = crsAndCoordinatesOfMaxExtent[0].crs;
    var givenCoordinates = {
        "minx": params.minx,
        "miny": params.miny,
        "maxx": params.maxx,
        "maxy": params.maxy
    };
    var maxExtent = {
        "minx": crsAndCoordinatesOfMaxExtent[0].minx,
        "miny": crsAndCoordinatesOfMaxExtent[0].miny,
        "maxx": crsAndCoordinatesOfMaxExtent[0].maxx,
        "maxy": crsAndCoordinatesOfMaxExtent[0].maxy
    };


    // If a coordinate system is specified, it is assumed that is different from the globale in (see endpoint maps).
    // So to validate the coordinates one hase to compare the coordinates from the request with the one from the globals bbox.
    if (params.crs) {
        requestedCrs = params.crs // Validity checked in checkQuery().

        proj4.defs([
            [
                'EPSG:4326',
                '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
            ],
            [
                'EPSG:4269',
                '+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees'
            ],
            [
                //ETRS89 / LCC Germany (E-N)
                'EPSG:5243',
                '+proj=longlat +ellps=intl +towgs84=162,117,154,0,0,0,0 +no_defs'
            ],
            [
                //ETRS89 / LCC Germany (N-E)
                'EPSG:4839',
                '+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs'
            ],
            [
                //DHDN / Soldner Berlin
                'EPSG:3068',
                '+proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs'
            ],


        ]);

        //I'm not going to redefine those two in latter examples.
        console.log("current Projection: " + currentCrs);
        console.log("requestedCrs: " + requestedCrs);

        //Transforming coordinates
        var mins = proj4(currentCrs, requestedCrs, {
            x: maxExtent.minx,
            y: maxExtent.miny
        });
        var maxs = proj4(currentCrs, requestedCrs, {
            x: maxExtent.maxx,
            y: maxExtent.maxy
        });

        // Assigning the given coordinates to the max Extent. Now requested coordinates and the max-bbox-coordinates are in the same system.

        maxExtent.minx = mins.x;
        maxExtent.miny = mins.y;
        maxExtent.maxx = maxs.x;
        maxExtent.maxy = maxs.y;
    }


    console.log("maxExtent.minx " + maxExtent.minx);
    console.log("givenCoordinates.minx " + givenCoordinates.minx);
    if (maxExtent.minx > givenCoordinates.minx || maxExtent.miny > givenCoordinates.miny || maxExtent.maxx < givenCoordinates.maxx || maxExtent.maxy < givenCoordinates.maxy) {
        console.log("THE EXTENT IS NOT OK");
        var message = new error.BadRequestError("The requested coordinates are not in the extent of the globale bbox. ");
        return {
            "ok": false,
            "error": {
                "error": message
            }
        };
    }

    console.log("EXTEND OK");
    return {
        "ok": true,
        "bbox": givenCoordinates
    };
}





function getRequestURL(layer, bbox, crs, width, height, serviceCache, services, id, format) {
    console.log("At function getRequestURL");
    var allLayers = false;
    var bboxString = null
    var ServiceGetCapabilities = serviceCache.getServices()[id];


    if (!layer) {
        layer = getAllLayersRequest(ServiceGetCapabilities.WMS_Capabilities.capability.layer);
    }
    if (!bbox) {
        bboxString = getGlobalBBOX(ServiceGetCapabilities);
        console.log("bbox is: " + bbox);
    } else {
        bboxString = bbox.miny + "," + bbox.minx + "," + bbox.maxy + "," + bbox.maxx;
        console.log("bboxString is: " + bboxString);
    }
    if (!crs) {
        crs = getCrs(ServiceGetCapabilities);
        console.log("crs is: " + crs);
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


    var baseURL = processJSON.getBaseURL(services, id) + "wms?";
    var service = "service=wms";
    var version = "version=" + ServiceGetCapabilities.WMS_Capabilities.version;
    var request = "request=GetMap";
    console.log("bboxString: " + bboxString);
    var requestURL = baseURL + service + "&" + version + "&" + request + "&" + "layers=" + layer + "&" + "bbox=" + bboxString + "&" + "crs=" + crs + "&" + "width=" + width + "&" + "height=" + height + "&" + "format=" + format;
    console.log("Constructed URL in getRequestURL");
    console.log(requestURL);
    return requestURL;
}


function checkRequestedService(services, id, serviceCache) {

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
  console.log("At function checkQuery");

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
      console.log("check params.layer");
        var notValid = checkLayers(serviceChache, params.id, params.layer); // Are they valid?
        console.log("Layer valid?: " + notValid);
        if (notValid) {
            var message = new error.BadRequestError("At least one requested layer is not valid");
            requestParams.layer = {
                "error": message
            };
        }

        requestParams.layer = params.layer;
    }

    if (params.crs) {
        console.log("At params.crs");
        // Is it supported?
        var layer = null;

        if (params.layer) {
            console.log("params.layer");
            layer = paras.layer.split(",");
            console.log(layer);
        } else {
            console.log("At else params.layer");
            console.log("params.id: " + params.id);
            console.log()
            var ServiceGetCapabilities = serviceChache.getServices()[params.id];
            console.log("ServiceVapabilities passed");
            layer = getAllLayersRequest(ServiceGetCapabilities.WMS_Capabilities.capability.layer);
            console.log("else layer" + layer);
        }

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
            console.log("CHECKING BBOX");
            requestParams.bbox = checkBbox(params, serviceChache) // Is the given bbox valid? getting bbox or error
        } else {
            var message = new error.BadRequestError("Not all parameters (minx, miny, maxx, maxy) given for the bbox");
            requestParams.bbox = {
                "error": message
            };
        }
    }

    if (params.width) {
        if (!isNaN(params.width) && Number(params.width > 0) && Number(params.width) % 1 === 0) {
            requestParams.width = params.width;
        } else {
            var message = new error.BadRequestError("width must be a integer greater than zero");
            requestParams.width = {
                "error": message
            };
        }
    }

    if (params.height) {
        if (!isNaN(params.height) && Number(params.height > 0) && Number(params.height) % 1 === 0) {
            requestParams.height = params.height;
        } else {
            var message = new error.BadRequestError("height must be a number greater than zero");
            requestParams.height = {
                "error": message
            };
        }
    }


    if (params.format) {
        var allowedValues = serviceChache.getServices()[params.id].WMS_Capabilities.capability.request.getMap.format;
        var isNotValid = true;

        for (var i = 0; i < allowedValues.length; i++) {
            if (String(params.format) === allowedValues[i]) {
                isNotValid = false;
            }
        }

        if (isNotValid) {
            var message = new error.BadRequestError("requested format is not valid. Valid formats are: " + allowedValues);
            requestParams.format = {
                "error": message
            };
        } else {
            requestParams.format = params.format;
        }

    }


    return requestParams;
}

// Description: Checks whether the requested layers are valid
function checkLayers(serviceCache, id, layer) {
  console.log("At function checkLayers");
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
        getLayerInfo: getLayerInfo,
        getAllLayersRequest: getAllLayersRequest,
        ggetGlobalBBOX: getGlobalBBOX,
        checkServices: checkServices,
        getRequestURL: getRequestURL,
        checkRequestedService: checkRequestedService,
        checkParameter: checkParameter,
        checkLayers: checkLayers,
        checkQuery: checkQuery

    }
