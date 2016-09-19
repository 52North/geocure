/**
This library offeres functionalities which are related with sending requests to a service.
**/
'use strict';

// External libraries
var proj4 = require("proj4");
var error = require("restify-error");

// Own libraries
var processGetCapabilities = require("./processGetCapabilities");
var processJSON = require("./processJSON");
var supportedCRS = require("../services/crs");




function getMaxExtentWMS (serviceCache, req) {
  console.log("At function getMaxExtentWMS");
  const crsAndCoordinatesOfMaxExtent = processGetCapabilities.getCRS(serviceCache.getServices()[req.params.id]);

  var maxExtent = {
      crs : crsAndCoordinatesOfMaxExtent[0].crs,
      minx: crsAndCoordinatesOfMaxExtent[0].minx,
      miny: crsAndCoordinatesOfMaxExtent[0].miny,
      maxx: crsAndCoordinatesOfMaxExtent[0].maxx,
      maxy: crsAndCoordinatesOfMaxExtent[0].maxy
  };

  console.log(maxExtent);


  console.log("Finishing getMaxExtentWMS");
  return maxExtent;
}


// Falls keine bbox für WFS unterstützt wird, rausnehmen, ansonsten überarbeiten.
function getMaxExtentWFS (serviceCache, req) {
console.log("At function getMaxExtentWFS");
  processGetCapabilities.getAllFeaturesInfo(serviceCache, req) //???
  const featureTypeList = processGetCapabilities.getAllFeatures(serviceCache.getServices()[req.params.id]);

  var maxExtent = [];
  for (var i = 0; i < featureTypeList.length; i++) {
      maxExtent.push({
          minx: featureTypeList[i].wgs84BoundingBox[0].lowerCorner[0],
          miny: featureTypeList[i].wgs84BoundingBox[0].lowerCorner[1],
          maxx: featureTypeList[i].wgs84BoundingBox[0].upperCorner[0],
          maxy: featureTypeList[i].wgs84BoundingBox[0].upperCorner[1]
      });
  }

  console.log("Finishing getMaxExtentWFS");
  return maxExtent;
}



/**
Signature: checkExtent : Object, Array-> Object

Description: Takes the parameter of a query and checks if they contain a valid bbox.
The array is the serviceCache which contains the getCapabilities of all offered services.

**/
function checkExtent(req, maxExtent) {
    var requestedCrs = null
    var currentCrs = maxExtent.crs;
    var givenCoordinates = {
        "minx": req.params.minx,
        "miny": req.params.miny,
        "maxx": req.params.maxx,
        "maxy": req.params.maxy
    };

    // If a coordinate system is specified, it is assumed that is different from the globale one (see endpoint maps).
    // So to validate the coordinates one hase to compare the coordinates from the request with the one from the globals bbox.
    if (req.params.crs) {
        requestedCrs = req.params.crs // Validity checked in checkQuery().

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
Signature: checkBbox : Object, Object-> String

Description: Takes the parameter of a query and checks if they contain a valid bbox.
The array is the serviceCache which contains the getCapabilities of all offered services.

**/

function checkBbox(req, maxExtent) {
    // Valid format? We only want to use numbers
    if (isNaN(req.params.minx)) {
        var message = new error.BadRequestError("minx is not a number");
        return {
            "error": message
        };
    }

    if (isNaN(req.params.miny)) {
        var message = new error.BadRequestError("miny is not a number");
        return {
            "error": message
        };
    }

    if (isNaN(req.params.maxx)) {
        var message = new error.BadRequestError("maxx is not a number");
        return {
            "error": message
        };
    }

    if (isNaN(req.params.maxy)) {
        var message = new error.BadRequestError("maxy is not a number");
        return {
            "error": message
        };
    }

    // logically correct?
    if (Number(req.params.minx) >= Number(req.params.maxx)) {
        var message = new error.BadRequestError("minx must be smaller than maxx");
        return {
            "error": message
        };
    }

    if (Number(req.params.miny) >= Number(req.params.maxy)) {
        var message = new error.BadRequestError("miny must be smaller than maxy");
        return {
            "error": message
        };
    }

    // in the context of the offered layer correct?
    var checkResult = checkExtent(req, maxExtent);

    if (checkResult.ok) { // If checkResult is ok (true)
        return checkResult.bbox;
    }

    return checkResult.error;

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
Signature: getMapRequestURL : Object, Object, Array-> Object

Description: Returns an url for getMap requests. If the query-parameter does not contain all parameters for the request,
they are supplemented by default values.

**/
function getMapRequestURL(req, serviceCache, services) {
    console.log("At function getMapRequestURL()");
    var checkedQuery = checkQuery(req, services, serviceCache);
    console.log("Query Parameter");
    console.log(checkedQuery);

    for (var key in checkedQuery) {
        try {
            if (checkedQuery[key].error) { // Was a queryparameter not valid?
                return (checkedQuery[key]); // Return the error.
            }
        } catch (err) {}
    }



    //
    var allLayers = false;
    var bboxString = null
    var ServiceGetCapabilities = serviceCache.getServices()[req.params.id];

    var layer = !checkedQuery.layer ? processGetCapabilities.getAllLayersAsString(ServiceGetCapabilities) : checkedQuery.layer;

    var bboxString = !checkedQuery.bbox ? processGetCapabilities.getGlobalBboxAsString(ServiceGetCapabilities) : (checkedQuery.bbox.miny + "," + checkedQuery.bbox.minx + "," + checkedQuery.bbox.maxy + "," + checkedQuery.bbox.maxx);

    var crs = !checkedQuery.crs ? processGetCapabilities.getCRS(ServiceGetCapabilities)[0].crs : checkedQuery.crs;

    var width = !checkedQuery.width ? getDefaultWidth(req, services) : checkedQuery.width;

    var height = !checkedQuery.height ? getDefaultHeight(req, services) : checkedQuery.height;

    var format = !checkedQuery.format ? getDefaultFormatMaps(req, services) : checkedQuery.format;

    var baseURL = processJSON.getBaseURL(services, req.params.id) + "wms?";
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


function getDefaultWidth(req, services) {
  for (let i = 0; i < services.length; i++) {
    if (req.params.id == services[i].id) {
      return services[i].capabilities.maps.defaultWidth;
    }
  }
}


function getDefaultHeight(req, services) {
  for (let i = 0; i < services.length; i++) {
    if (req.params.id == services[i].id) {
      return services[i].capabilities.maps.defaultHeight;
    }
  }
}


function getDefaultFormatMaps(req, services) {
  for (let i = 0; i < services.length; i++) {
    if (req.params.id == services[i].id) {
      return services[i].capabilities.maps.defaultFormat;
    }
  }
}

function getDefaultFormatFeatures(req, services) {
  for (let i = 0; i < services.length; i++) {
    if (req.params.id == services[i].id) {
      return services[i].capabilities.features.defaultFormat;
    }
  }
}


/**
Signature: checkQueryFeatures : Object, Array, Array-> Object

Description: Checks the parameter of a get map request for their validity.

**/
function checkQueryFeatures(req, services, WFSCache) {
    console.log("At function checkQueryFeatures");

    //Parameters needed for construction of the request URL
    // By returning this, it can be decided later how tor react on not valid query content
    var requestParams = {
        features: null,
        bbox: null,
        srs: null,
        format: null
    }


    if (req.params.features) {

        var featureCheck = checkFeatures(req.params.features, WFSCache.getServices()[req.params.id]); // Are they valid?

        if (featureCheck.body) {
          console.log("Requested feature did not past test.")
          return featureCheck;
        }
        else {
            console.log("Feature valid");
            requestParams.features = req.params.features;
        }
    }


    if (req.params.srs) {
        console.log("At params.srs");

        if(crsValid(req.params.srs)) {
          requestParams.srs = req.params.srs;
        } else {
            return new error.BadRequestError("The requested CRS is not supported.");
        }
    }


    if (req.params.minx || req.params.miny || req.params.maxx || req.params.maxy) { // Are elements of a bbox requested?
        if (req.params.minx && req.params.miny && req.params.maxx && req.params.maxy) { // Are they complete?
            console.log("CHECKING BBOX");
            requestParams.bbox = checkBbox(req, getMaxExtentWFS(WFSCache, req)); // Is the given bbox valid? getting bbox or error
        } else {
          return new error.BadRequestError("Not all parameters (minx, miny, maxx, maxy) given for the bbox");
        }
    }


    console.log("Format check? " + req.params.format);
    if (req.params.format) {
      console.log("Check the format")
        // Problem is: There are formats, which do have a "+" - sign and/ore a "; " in their name.
        // "+" is a whitespace in URLs. So we have to replace unintended whitespaces
        var requestedFormat = String(req.params.format).replace("; ","placemark"); // mark intended whitespaces
        requestedFormat = requestedFormat.replace(" ", "+");
        requestedFormat = requestedFormat.replace("placemark", "; "); // recreate intended whitespaces
        console.log("REQUESTED FORMAT = " + requestedFormat);

        var validFormats = [];
        console.log("validFormats are " + validFormats);
        var operations = WFSCache.getServices()[req.params.id]["wfs:WFS_Capabilities"]["operationsMetadata"]["operation"];

        for (let i = 0; i < operations.length; i++){
          if (operations[i].name === "GetFeature") {
            var k = 0;
            while (operations[i].parameter[k]) {
              if (operations[i].parameter[k].name === "outputFormat") {
                validFormats = operations[i].parameter[k].value;
                break;
              }
              else {
                ++k;
              }
            }
          }
        }

        // Is the requested format a member of validFormats?
        var notValid = true;
        for (let i = 0; i < validFormats.length; i++) {
          if (validFormats[i] === requestedFormat) {
            notValid = false;
            break;
          }
        }

        // Action according requested format is valid / not valid

        if (notValid) {
          return new error.BadRequestError("The requested format is not supported. Supported formats are : " + validFormats);
        }
        else {
          requestParams.format = req.params.format;
        }
    }

    return requestParams;

}



/**
Signature: getFeatureRequestURL : Object, Object, Array-> Object

Description: Returns an url for getFeature requests. If the query-parameter does not contain all parameters for the request,
they are supplemented by default values.

**/

function getFeatureRequestURL(req, WFSCache, services) {
  console.log("At function getFeatureRequestURL");
  var checkedQuery = checkQueryFeatures(req, services, WFSCache);
  console.log("checkedQuery error ? " + checkedQuery);
  if (checkedQuery.body) { // If true -> error

    return checkedQuery;
  }

  var baseURL = processJSON.getBaseURL(services, req.params.id) + "wfs?";
  var service = "service=wfs";

  var serviceGetCapabilities = WFSCache.getServices()[req.params.id];
  var version = "version=" + serviceGetCapabilities["wfs:WFS_Capabilities"]["version"];

  var request = "request=GetFeature";
  var featureID = checkedQuery.features;
  var outputformat = "outputFormat=" + (checkedQuery.format || getDefaultFormatFeatures(req, services));
  console.log(outputformat);

  var requestURL = baseURL + service + "&" + version + "&" + request + "&" + "typeName=" + featureID + "&" + outputformat;

  console.log("Finishing getFeatureRequestURL");
  return requestURL;
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
function checkQuery(req, services, serviceChache) {
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

    if (req.params.layer) { // Are specific layers requested? If not, All Layers will be requested later in getRequestURL
        console.log("check params.layer");
        var notValid = checkLayers(serviceChache, req.params.id, req.params.layer); // Are they valid?
        console.log("Layer not valid?: " + notValid);
        if (notValid) {
            var message = new error.BadRequestError("At least one requested layer is not valid");
            console.log("Error message assigned");
            requestParams.layer = {
                "error": message
            };
        } else {
            console.log("Layer valid");
            requestParams.layer = req.params.layer;

        }
    }


    if (req.params.crs) {
        console.log("At params.crs");
        // Is it supported?
        var layer = null;

        if (req.params.layer) {
            console.log("params.layer");
            layer = req.params.layer.split(",");
            console.log(layer);
        } else {
            console.log("At else params.layer");
            console.log("params.id: " + req.params.id);
            console.log()
            var ServiceGetCapabilities = serviceChache.getServices()[req.params.id];
            console.log("ServiceVapabilities passed");
            layer = processGetCapabilities.getAllLayersAsString(ServiceGetCapabilities);
            console.log("else layer" + layer);
        }

        var crsSupported = crsValid(req.params.crs);
        console.log("PARAMS:CRS: " + req.params.crs);
        if (crsSupported) {
            requestParams.crs = req.params.crs;
        } else {
            var message = new error.BadRequestError("The requested CRS is not supported for all layers");
            requestParams.crs = {
                "error": message
            };
        }
    }


    if (req.params.minx || req.params.miny || req.params.maxx || req.params.maxy) { // Are elements of a bbox requested?
        if (req.params.minx && req.params.miny && req.params.maxx && req.params.maxy) { // Are they complete?
            console.log("CHECKING BBOX");
            requestParams.bbox = checkBbox(req, getMaxExtentWMS(serviceChache, req)); // Is the given bbox valid? getting bbox or error
        } else {
            var message = new error.BadRequestError("Not all parameters (minx, miny, maxx, maxy) given for the bbox");
            requestParams.bbox = {
                "error": message
            };
        }
    }

    if (req.params.width) {
      console.log("width is: " +  req.params.width);
        if (!isNaN(req.params.width) && Number(req.params.width > 0) && Number(req.params.width) % 1 === 0) {
            requestParams.width = req.params.width;
        } else {
            var message = new error.BadRequestError("Width must be a integer greater than zero");
            requestParams.width = {
                "error": message
            };
        }
    }


    if (req.params.height) {
        if (!isNaN(req.params.height) && Number(req.params.height > 0) && Number(req.params.height) % 1 === 0) {
            requestParams.height = req.params.height;
        } else {
            var message = new error.BadRequestError("Height must be a number greater than zero");
            requestParams.height = {
                "error": message
            };
        }
    }


    if (req.params.format) {
      console.log("USER INPUT FORMAT = " + req.params.format);

        // Problem is: There are formats, which do have a "+" - sign and/ore a "; " in their name.
        // "+" is a whitespace in URLs. So we have to replace unintended whitespaces
        var format = String(req.params.format).replace("; ","placemark"); // mark intended whitespaces
        format = format.replace(" ", "+");
        format = format.replace("placemark", "; "); // recreate intended whitespaces

        var allowedValues = serviceChache.getServices()[req.params.id].WMS_Capabilities.capability.request.getMap.format;
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
            requestParams.format = req.params.format;
        }

    }

    console.log("Finishing checkQuery()");
    return requestParams;
}







/**
Signature: checkFeatures : Array, Object-> error ||

Description: Checks whether requested features are supported. If not, an error will be returned.

**/
function checkFeatures (feature, getCapabilities) {
  console.log("At function checkFeatures()");
  var requestedFeatures = String(feature).split(",");
  var offeredFeatures = processGetCapabilities.getAllFeatures(getCapabilities);
  var offeredFeaturesTitle = [];

  for (var element in offeredFeatures) {
    try {
      offeredFeaturesTitle.push(offeredFeatures.title);
    }
    catch (e) {
      console.log("Finishing checkFeatures()");
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
      console.log("Finishing checkFeatures()");
      return new error.BadRequestError("The requested feature '" + element + "' is not supported. Supported features are: " + offeredFeaturesTitle.toString());
    }
  }

return {};
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
    console.log("Finishing checkLayers()");
    return notValid;
}





module.exports = {
    getMapRequestURL: getMapRequestURL,
    checkRequestedService: checkRequestedService,
    getFeatureRequestURL: getFeatureRequestURL
}
