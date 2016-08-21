/**
This library is intended to process getCapabilities, which are passed as JSON-format.
**/

var error = require("restify-error");

/**
Signature: getCRS : JSON-Object -> JSON-Object

Description: Takes getCapabilities and returns the information about the CRS and the bbox.
**/
function getCRS(getCapabilities) {
    console.log("At getCRS()");

    // Do the capabilities contain the used properties?
    if (!getCapabilities) {
        return new error.InternalServerError("The getCapabilities are not accessible");
    }
    if (!getCapabilities.WMS_Capabilities) {
        return new error.InternalServerError("The key 'WMS_Capabilities' is not accessible in getCapabilities");

    }
    if (!getCapabilities.WMS_Capabilities.capability) {
        return new error.InternalServerError("The key 'capability' is not accessible in getCapabilities.WMS_Capabilities");
    }
    if (!getCapabilities.WMS_Capabilities.capability.layer) {
        return new error.InternalServerError("The key 'layer' is not accessible in getCapabilities.WMS_Capabilities");
    }

    //console.log(Layer);
    var response = null;
    if ("boundingBox" in getCapabilities.WMS_Capabilities.capability.layer) {
        response = [];
        response = getCapabilities.WMS_Capabilities.capability.layer.boundingBox;
        if (response[0].crs === "CRS:84") {
            response[0].crs = "EPSG:4326";
        }
    } else {
        response = new error.InternalServerError("The key 'boundingBox' is not accessible in getCapabilities.WMS_Capabilities.capability.layer");
    }
    console.log("Finishing getCRS()");
    return response;
}



/**
Signature: getLayerInfo : JSON-Object, String -> Array

Description: Takes getCapabilities (JSON-Object) and the current request-url (String) and returns an array, which holds an object.
The key-value pair has following structure: name of the layer : URL to the endpoint which renders the layer in the max. bbox of the service
**/

function getLayerInfo(getCapabilities, requestURL) {
    console.log("At getLayerInfo()");
    var layersObject = {}; // Object to be filled
    if (!getCapabilities) {
        return new error.InternalServerError("The getCapabilities are not accessible");
    }
    if (!getCapabilities.WMS_Capabilities) {
        return new error.InternalServerError("The key 'WMS_Capabilities' is not accessible in getCapabilities");

    }
    if (!getCapabilities.WMS_Capabilities.capability) {
        return new error.InternalServerError("The key 'capability' is not accessible in getCapabilities.WMS_Capabilities");
    }
    if (!getCapabilities.WMS_Capabilities.capability.layer) {
        return new error.InternalServerError("The key 'layer' is not accessible in getCapabilities.WMS_Capabilities");
    }

    var layer = getCapabilities.WMS_Capabilities.capability.layer;
    if ("name" in layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        res.send("name gefunden"); // TO Do:  Implemenetation of something useful!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } else {
        for (var i = 0; i < layer.layer.length; i++) {
            var key = layer.layer[i].name;
            layersObject[key] = requestURL + '/' + key + "/render";
        }
    }
    console.log("Finishing getLayerInfo()");
    return layersObject;
}



/**
Signature: getAllLayersAsString : JSON-Object -> String

Description: Takes getCapabilities and returns all names of offered layers as a string.
**/
function getAllLayersAsString(getCapabilities) {
    console.log("At getAllLayersRequest()");
    var layerObject = getLayerInfo(getCapabilities, ""); // Setting URL to empty string because we do not need it here
    if (layerObject.code) { // restify-error is an object with the properties 'code' and 'message'. Here we check for the property 'code'. If this property exists, we assume an error and pass the message
      return layerObject;
    }
    var keys = Object.keys(layerObject);
    return keys.toString();
}

module.exports = {
    getCRS: getCRS,
    getLayerInfo: getLayerInfo,
    getAllLayersAsString, getAllLayersAsString
}
