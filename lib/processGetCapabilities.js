/**
This library is intended to process getCapabilities, which are passed as JSON-format.
**/



/**
Signature: unmarshallXML : String, function

Description: Takes a URL (String), requests the URL and performes the passed function on the request-result.
The request-result is JSON structure which was previously XML
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
    }
    else {
      response = new error.InternalServerError("The key 'boundingBox' is not accessible in getCapabilities.WMS_Capabilities.capability.layer");
    }
    console.log("Finishing getCRS()");
    return response;
}


module.exports = {
  getCRS : getCRS
}
