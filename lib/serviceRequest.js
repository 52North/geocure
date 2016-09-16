/**
This library offeres functionalities which are related with sending requests to a service.
**/

// External libraries
var proj4 = require("proj4");
var error = require("restify-error");

// Own libraries
var processGetCapabilities = require("./processGetCapabilities");
var processJSON = require("./processJSON");
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




/**
Signature: crsValid : String -> Boolean

Description: If the requested CRS is specified in services.crs, true will be returned. Else false.

**/
function crsValid(crs) {
    for (var i = 0; i < supportedCRS.get().length; i++) {
        console.log(supportedCRS.get()[i][0]);
        return supportedCRS.get()[i][0] === String(crs);
    }
}



/**
Signature: getRequestURL : Object, Object, Array-> Object

Description: Returns an url for getMap requests. If the query-parameter does not contain all parameters for the request,
they are supplemented by default values.

**/
function getMapRequestURL(params, serviceCache, services) {
    console.log("At function getMapRequestURL()");
    var checkedQuery = checkQuery(params, services, serviceCache);
    console.log("Query Parameter");
    console.log(checkedQuery);

    for (var key in checkedQuery) {
        try {
            if (checkedQuery[key].error) { // Was a queryparameter not valid?
                return (checkedQuery[key]); // Return the error.
            }
        } catch (err) {}
        console.log("Year, it is!");
    }

    console.log("Query parameters seem to be ok");

    //
    var allLayers = false;
    var bboxString = null
    var ServiceGetCapabilities = serviceCache.getServices()[params.id];

    var layer = !checkedQuery.layer ? processGetCapabilities.getAllLayersAsString(ServiceGetCapabilities) : checkedQuery.layer;

    if (!checkedQuery.bbox) {
        var bboxString = processGetCapabilities.getGlobalBboxAsString(ServiceGetCapabilities);
        console.log("bboxString is: " + bboxString);
    } else {
        var bboxString = checkedQuery.bbox.miny + "," + checkedQuery.bbox.minx + "," + checkedQuery.bbox.maxy + "," + checkedQuery.bbox.maxx;
        console.log("bboxString is: " + bboxString);
    }
    if (!checkedQuery.crs) {
        var crs = processGetCapabilities.getCRS(ServiceGetCapabilities)[0].crs;
        console.log("crs is: " + crs);
    } else {
        var crs = checkedQuery.crs;
    }
    if (!checkedQuery.width) {
        var width = services[0].defaultWidth;
    } else {
      var width = checkedQuery.width;
    }
    if (!checkedQuery.height) {
        console.log("Get default height")
        height = services[0].defaultHeight;
        console.log("Default height is: " + height);
    } else {
        var height = checkedQuery.height;
    }

    if (!checkedQuery.format) {
        format = services[0].defaultFormat;
        console.log("Default format is: " + format);
    } else {
        var format = checkedQuery.format;
    }


    var baseURL = processJSON.getBaseURL(services, params.id) + "wms?";
    var service = "service=wms";
    var version = "version=" + ServiceGetCapabilities.WMS_Capabilities.version;
    var request = "request=GetMap";
    console.log("bboxString: " + bboxString);
    var requestURL = baseURL + service + "&" + version + "&" + request + "&" + "layers=" + layer + "&" + "bbox=" + bboxString + "&" + "crs=" + crs + "&" + "width=" + width + "&" + "height=" + height + "&" + "format=" + format;
    console.log("Constructed URL in getRequestURL");
    console.log(requestURL);
    console.log("Finishing getMapRequestURL()");
    return requestURL;
}


/**
Signature: getFeatureRequestURL : Object, Object, Array-> Object

Description: Returns an url for getFeature requests. If the query-parameter does not contain all parameters for the request,
they are supplemented by default values.

**/

function getFeatureRequestURL(req, WFSCache, services) {
  var checkedQuery = checkQueryFeatures(req, services, WFSCache);
}


/**
Signature: checkRequestedService : Array, String, Array-> error || Boolean

Description: Chekcs whether the requested service-id (String), is supported.
false will be returned if everything is ok (maybe not so intuitive, but makes reading code a liddle bit easier).
If the id is not in the file "services.json" or the corresponding capabilities are not available, an error will be returned.
**/

function checkRequestedService(services, id, serviceCache) {
    console.log("At function checkRequestedService()");
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


    if (processGetCapabilities.getAllLayersAsString(ServiceGetCapabilities).code) {
        return processGetCapabilities.getAllLayersAsString(ServiceGetCapabilities);
    }

    console.log("Finishing checkRequestedService()");
    return false;

}



/**
Signature: checkQuery : Object, Array, Array-> Object

Description: Checks the parameter of a get map request for their validity.

**/
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
        console.log("Layer not valid?: " + notValid);
        if (notValid) {
            var message = new error.BadRequestError("At least one requested layer is not valid");
            console.log("Error message assigned");
            requestParams.layer = {
                "error": message
            };
        } else {
            console.log("Layer valid");
            requestParams.layer = params.layer;

        }
    }

    if (params.crs) {
        console.log("At params.crs");
        // Is it supported?
        var layer = null;

        if (params.layer) {
            console.log("params.layer");
            layer = params.layer.split(",");
            console.log(layer);
        } else {
            console.log("At else params.layer");
            console.log("params.id: " + params.id);
            console.log()
            var ServiceGetCapabilities = serviceChache.getServices()[params.id];
            console.log("ServiceVapabilities passed");
            layer = processGetCapabilities.getAllLayersAsString(ServiceGetCapabilities);
            console.log("else layer" + layer);
        }

        var crsSupported = crsValid(params.crs);
        console.log("PARAMS:CRS: " + params.crs);
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
      console.log("width is: " +  params.width);
        if (!isNaN(params.width) && Number(params.width > 0) && Number(params.width) % 1 === 0) {
            requestParams.width = params.width;
        } else {
            var message = new error.BadRequestError("Width must be a integer greater than zero");
            requestParams.width = {
                "error": message
            };
        }
    }

    if (params.height) {
        if (!isNaN(params.height) && Number(params.height > 0) && Number(params.height) % 1 === 0) {
            requestParams.height = params.height;
        } else {
            var message = new error.BadRequestError("Height must be a number greater than zero");
            requestParams.height = {
                "error": message
            };
        }
    }


    if (params.format) {
      console.log("USER INPUT FORMAT = " + params.format);

        // Problem is: There are formats, which do have a "+" - sign and/ore a "; " in their name.
        // "+" is a whitespace in URLs. So we have to replace unintended whitespaces
        var format = String(params.format).replace("; ","placemark"); // mark intended whitespaces
        format = format.replace(" ", "+");
        format = format.replace("placemark", "; "); // recreate intended whitespaces

        var allowedValues = serviceChache.getServices()[params.id].WMS_Capabilities.capability.request.getMap.format;
        var isNotValid = true;

        for (var i = 0; i < allowedValues.length; i++) {
            if (format === allowedValues[i]) {
                isNotValid = false;
            }
        }

        if (isNotValid) {
            var message = new error.BadRequestError("Requested format is not valid. Valid formats are: " + allowedValues);
            requestParams.format = {
                "error": message
            };
        } else {
            requestParams.format = params.format;
        }

    }


    return requestParams;
}





/**
Signature: checkQueryFeatures : Object, Array, Array-> Object

Description: Checks the parameter of a get map request for their validity.

**/
function checkQueryFeatures(req, services, WFSCache) {
    console.log("At function checkQuery");

    //Parameters needed for construction of the request URL
    // By returning this, it can be decided later how tor react on not valid query content
    var requestParams = {
        "features": null,
        "bbox": null,
        "crs": null,
        "width": null,
        "height": null,
        "format": null
    }

    if (req.params.features) {
        console.log("check params.features");
        var featureCheck = checkFeatures(req.params.feature, WFSCache.getServices()[req.params.id]); // Are they valid?
        console.log("Features not valid?: " + notValid);
        if (featureCheck.body) {
          return featureCheck;
        }
        else {
            console.log("Feature valid");
            requestParams.features = req.params.features;

        }
    }


    if (req.params.crs) {
        console.log("At params.crs");

        if(crsValid(req.params.crs)) {
          requestParams.crs = req.params.crs;
        } else {
            return new error.BadRequestError("The requested CRS is not supported.");
        }
    }


    // Work on here.
    //IN checkBbox remove serviceCache as parameter. Insted insert max bbox'here. Adapt checkBbox. So we can use it for WMS and WFS.
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
      console.log("width is: " +  params.width);
        if (!isNaN(params.width) && Number(params.width > 0) && Number(params.width) % 1 === 0) {
            requestParams.width = params.width;
        } else {
            var message = new error.BadRequestError("Width must be a integer greater than zero");
            requestParams.width = {
                "error": message
            };
        }
    }

    if (params.height) {
        if (!isNaN(params.height) && Number(params.height > 0) && Number(params.height) % 1 === 0) {
            requestParams.height = params.height;
        } else {
            var message = new error.BadRequestError("Height must be a number greater than zero");
            requestParams.height = {
                "error": message
            };
        }
    }


    if (params.format) {
      console.log("USER INPUT FORMAT = " + params.format);

        // Problem is: There are formats, which do have a "+" - sign and/ore a "; " in their name.
        // "+" is a whitespace in URLs. So we have to replace unintended whitespaces
        var format = String(params.format).replace("; ","placemark"); // mark intended whitespaces
        format = format.replace(" ", "+");
        format = format.replace("placemark", "; "); // recreate intended whitespaces

        var allowedValues = serviceChache.getServices()[params.id].WMS_Capabilities.capability.request.getMap.format;
        var isNotValid = true;

        for (var i = 0; i < allowedValues.length; i++) {
            if (format === allowedValues[i]) {
                isNotValid = false;
            }
        }

        if (isNotValid) {
            var message = new error.BadRequestError("Requested format is not valid. Valid formats are: " + allowedValues);
            requestParams.format = {
                "error": message
            };
        } else {
            requestParams.format = params.format;
        }

    }

}



/**
Signature: checkFeatures : Array, Object-> error ||

Description: Checks whether requested features are supported. If not, an error will be returned.

**/
function checkFeatures (feature, getCapabilities) {

  var requestedFeatures = String(feature).splot(",");
  var offeredFeatures = processGetCapabilities.getAllFeatures(getCapabilities);
  var offeredFeaturesTitle = [];

  for (var element in offeredFeatures) {
    try {
      offeredFeaturesTitle.push(offeredFeatures.title);
    }
    catch (e) {
      return new error.InternalServerError("Error while checking offered Features");
    }
  }



  // Requested layer supported?
  for (var element in requestedFeatures) {
    var notContained = true;
    for (var checkElement in offeredFeaturesTitle) {
      if (String(element) === String(checkElement)) {
        notContained = false;
        break;
      }
    }

    if (notContained) {
      return new error.BadRequestError("The requested feature '" + element + "' is not supported. Supported features are: " + offeredFeaturesTitle.toString());
    }
  }


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





module.exports = {
    getMapRequestURL: getMapRequestURL,
    checkRequestedService: checkRequestedService
}
