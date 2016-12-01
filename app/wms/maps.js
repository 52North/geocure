const errorhandling = require("../general/errorhandling.js");

/**
 * Returns the offered layers and the max bbox (see getExGeographicBoundingBox).
 * @param  {Object}    serviceCache The WMS-cache
 * @param  {Object}    requestargs  Argument of the requests
 * @return {Object}                 JSON-Object
 */
function describeMap(serviceCache, requestargs){
  // console.log(serviceCache);
  try{
    const serviceCapabilities = serviceCache.find(service => {return service.id == requestargs.params.id});
    //console.log("serviceCapabilities = " + JSON.stringify(serviceCapabilities))
    // if(!serviceCapabilites){
    //   console.log("I throw sm")
    //   throw errorhandling.getError("requestResponses", "bad:id");
    // }
    const layers = getAllLayers(serviceCapabilities, requestargs);
    const crs = getExGeographicBoundingBox(serviceCapabilities);

    return {"layers": layers, "crs": crs};

  }
catch (error) {
  throw error;
}

}


/**
 * Takes the getCapabilities of an WMS 1.3.0 and returns its max. bbox
 * 'EX_GeographicBoundingBox states, via the elements westBoundLongitude,
 * eastBoundLongitude, southBoundLatitude, and northBoundLatitude, the minimum bounding rectangle in decimal
 * degrees of the area covered by the Layer' (OpenGIS WMS Implementation Specification 1.3.0 Document 06-042)
 * @param  {Object}                   capabilities The getCapabilities as a JSON-object
 * @return {Object}                                The EX_GeographicBoundingBox
 */
function getExGeographicBoundingBox(capabilities){
  try
  {
    const response = capabilities.capabilities.WMS_Capabilities.capability.layer.exGeographicBoundingBox;

    // Adding missing Information
    response["crs"] = "EPSG:4326";
    return response;
  }
  catch (error)
  {
    throw errorhandling.getError("requestResponses", "badCapabilitiesAccess", "Tried to get 'exGeographicBoundingBox'");
  }

}


/**
 * Returns an array with objects.
 * Each object describes one layer with 'name', 'title', 'href'
 * @param  {Object}     capabilities getCapabilites as a JSON-object
 * @param {Object}      requestargs Arguments of thr request
 * @return {Array}                  Array with the layer-objects
 */
function getAllLayers(capabilities, requestargs){
  try{
    const layerCollection = [];
    capabilities.capabilities.WMS_Capabilities.capability.layer.layer.forEach(layer => {
      const layerObject = {};
      layerObject["id"] = layer.name;
      layerObject["title"] = layer.title;
      layerObject["href"] = requestargs.fullUrl + "/render";
      layerCollection.push(layerObject);
    });
    return layerCollection;
  }
  catch (error) {
    throw errorhandling.getError("requestResponses", "badCapabilitiesAccess", "Tried to get all Layers");
  }
}

function render(capabilities, requestargs){

}

module.exports = {
    getExGeographicBoundingBox : getExGeographicBoundingBox,
    describeMap : describeMap
}