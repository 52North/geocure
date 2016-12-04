const generalURLConstructor = require("../general/url.js");
const coordinates = require("../general/coordinates.js")
const errorhandling = require("../general/errorhandling.js");
const maps = require("./maps.js");
const transformationParameters = require("../config/transformationParameter.js");

// Constants
const version = "1.3.0";
const defaultCRS = "EPSG:4326"
        /**
         * Takes the URL of an service and creates the basic part for all requests.
         * Basic part consists of: the requested service ("wms") and the version.
         * @method getCapabilities
         * @param  {String}        serviceURL The Baseurl to the service
         * @return {String}                   The constructed url
         */
function getCapabilities(serviceURL) {
        "use strict"

        let url = generalURLConstructor.getBaseURL(serviceURL, ["wms", version]);
        return url + "&REQUEST=getCapabilities";
}



function getMap(serviceURL, requestargs) {
        "use strict"

        let baseURL = generalURLConstructor.getBaseURL(serviceURL, ["wms", version]) + "&REQUEST=GetMap";


}




function GetMapURL(serviceCache, baseURL, requestargs) {
        "use strict"

        let url = baseURL;

        // Adding Layers
        try {
                layerValid(serviceCache, requestargs);
                url += "&LAYERS=" + requestargs.layers;
        } catch (error) {
                throw error
        }

        // As no seperated styling is supported. So styles is empty to use default styling
        url += "&STYLES=";

        // Adding CRS
        try {
                const crs = getCRS(serviceCache, requestargs);
        } catch (error) {
          throw error;
        }

        url += "&CRS=" + crs;


        // Adding bbox


}


// TODO bbox realisieren.
// function getBbox(capabilities, requestargs) {
// "use strict";
//   // If no bbox is given, return a default-bbox.
//   // If no crs is given, use EPGS:4326
//   // Otherwise use cooedinates in the given crs.
//   // This is important, because images can be returned with a spatial reference.
//   if(!requestargs.bbox){
//     const defaultBbox(capabilities, requestargs);
//   }
//   else{
//
//   }
// }

/**
 * Returns a stringrepresentation of the bbox, which is maximum in extend.
 * If no crs is given: EPSG:4326
 * Otherwise the given system if valid
 * @param  {Object}       capabilities Capabilities of the requested service.
 * @param  {Object}       requestargs  The arguments from the requestargs
 * @return {String}                    Concatenation if minx,miny,maxx,maxy
 * @throws {Error}                     Otherwise
 */
function getdefaultBbox(capabilities, requestargs){
  "use strict";
  try{
    const maxBbox = capabilities.capabilities.WMS_Capabilities.capability.layer.exGeographicBoundingBox;

    if(!maxBbox){
      throw errorhandling.getError("requestResponses", "badCapabilitiesAccess", "Tried to get 'exGeographicBoundingBox'");
    }

    const targetCrs = getCRS(capabilities, requestargs);

    if(targetCrs === "EPSG:4326"){
      //then no transformation is needed, because maxBbox is given in EGPS:4326 via specification.
      return "" + maxBbox.westBoundLongitude + "," + maxBbox.southBoundLatitude + "," + maxBbox.eastBoundLongitude + "," + maxBbox.northBoundLatitude;
    }
    else {
      // Targetsystem validation already happened in getCrs
      const minis = coordinates.transformation(maxBbox.westBoundLongitude, maxBbox.southBoundLatitude, "EPSG:4326", targetCrs);
      const maxis = coordinates.transformation(maxBbox.eastBoundLongitude, maxBbox.northBoundLatitude, "EPSG:4326", targetCrs);

      return "" + minis.x + "," + minis.y + "," + maxis.x + "," + maxis.y;
    }

  }
  catch (error) {
    throw error;
  }

}


/**
 * If no CRS is given in the requestarguments, a default CRS will be returned
 * If crs is a requestargument, it will be checked against the crs in the getCapabilities
 * and transformationParameter.js. If everything is ok, the crs will be returned,
 * otherwise an error will be thrown.
 * @param  {Object} capabilities Object describing the Capabilities of a service (JSON)
 * @param  {Object} requestargs  Arguments of the request
 * @return {String}              EPSG Code of a crs
 * @throws {Error}               Otherwise
 */
function getCRS(capabilities, requestargs) {
        "use strict"
        if (!requestargs.crs) {
                return defaultCRS;
        } else {

                var supportedByTransformationParameter = transformationParameters.get().find(element => {
                        return element[0] === requestargs.crs
                })
                var supportedByGetCapabilities = capabilities.capabilities.WMS_Capabilities.capability.layer.crs.find(element => {
                        return element === requestargs.crs
                });

                if (supportedByTransformationParameter && supportedByGetCapabilities) {
                        return requestargs.crs;
                } else {
                        throw errorhandling.getError("requestResponses", "crs", requestargs.crs);
                }
        }
}


/**
 * Checks the layers, given as a queryparameter, whether they are valid
 * @param  {Object}   capabilities Cache of the WMS-getCapabilities
 * @param  {Object}   requestargs  Arguments of the request
 * @return {Boolean}               If everything is ok
 * @throws {Exception}             Esle
 */
function layerValid(capabilities, requestargs) {
        "use strict"

        // We need at least one layer for a request
        if (requestargs.layers === "undefined") {
                throw errorhandling.getError("requestResponses", "badLayerRequest", "No layer was given.");
        }

        // Are all requested layers supported?
        var requestedLayers = requestargs.layers.split(",");

        // As the result is constructed from the getCapabilities, it can be used to validate the layer request
        let supportedLayers = maps.getAllLayers(capabilities, requestargs);

        try {
                requestedLayers.forEach(requested => {
                        const searchRes = supportedLayers.find(name => {
                                return name.id === requested;
                        });

                        if (!searchRes) {
                                throw errorhandling.getError("requestResponses", "badLayerRequest", ("The requested layer '" + requested + " is not supported"));
                        }
                });

                // If everything is fine
                return true;
        } catch (error) {
                throw error;
        }

}

module.exports = {
        getCapabilities: getCapabilities,
        getMap: getMap,
        layerValid: layerValid,
        getCRS: getCRS,
        getdefaultBbox: getdefaultBbox
}
