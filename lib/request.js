/**
This library offeres functionalities which are related which sending requests to a service.
**/

'use strict';

// Internal libraries
var processGetCapabilities = require("./processGetCapabilities");
// External libraries
var proj4 = require("proj4");
var error = require("restify-error");
var supportedCRS = require("../services/crs");


/**
Signature: checkBbox : Object, Array-> String

Description: Takes the parameter of a query and checks if they contain a valid bbox.
The array is the serviceCache which contains the getCapabilities of all offered services.

**/

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




/**
Signature: checkExtent : Object, Array-> Object

Description: Takes the parameter of a query and checks if they contain a valid bbox.
The array is the serviceCache which contains the getCapabilities of all offered services.

**/
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


    // If a coordinate system is specified, it is assumed that is different from the globale one (see endpoint maps).
    // So to validate the coordinates one hase to compare the coordinates from the request with the one from the globals bbox.
    if (params.crs) {
        requestedCrs = params.crs // Validity checked in checkQuery().

        proj4.defs(supportedCRS.get());

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
        var message = new error.BadRequestError("The requested coordinates are not in the extent of the globale bbox.");
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




/**
Signature: checkExtent : Object, Array-> Object

Description: Takes the parameter of a query and checks if they contain a valid bbox.
The array is the serviceCache which contains the getCapabilities of all offered services.

**/
function checkCrs(serviceCache, id, crs) {
    console.log("Entering checkCrs()");
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
