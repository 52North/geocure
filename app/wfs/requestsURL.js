const generalURLConstructor = require("../general/url.js");
const coordinates = require("../general/coordinates.js")
const transformationParameters = require("../config/transformationParameter.js");
const features = require("./features");

// Constants
const version = "2.0.0";
const defaultCRS = "EPSG:4326"

        /**
         * Takes the URL of an service and creates the basic part for all requests.
         * Basic part consists of: the requested service ("wfs") and the version.
         * @method getCapabilities
         * @param  {String}        serviceURL The Baseurl to the service
         * @return {String}                   The constructed url
         */
function getCapabilities(serviceURL) {
        "use strict"

        let url = generalURLConstructor.getBaseURL(serviceURL, ["wfs", version]);
        console.log(url + "&REQUEST=getCapabilities");
        return url + "&REQUEST=getCapabilities";
}

function getFeature(cacheWFS, requestargs, services){
  "use strict"

  // Securing Service
  const serviceConfiguration = services.find(service => {
          return service.id === requestargs.params.id
  });

  if (!serviceConfiguration){
    throw errorhandling.getError(404, "Not Found", "getFeature", "Service with requested id not found");
  }

  if(!serviceConfiguration.capabilities.features.enabled){
    throw errorhandling.getError(404, "Not Found", "getFeature", "Service with requested id not found");
  }


  const serviceCache = cacheWFS.getCache().find(obj => {return obj.id === requestargs.params.id});

  if (!serviceCache){
    throw errorhandling.getError(500, "serviceCache", "getFeature", "serviceCache not available");
  }

  try {
          let url = generalURLConstructor.getBaseURL(serviceConfiguration.url, ["wfs", version]) + "&REQUEST=GetFeature";

          url += "&TYPENAMES=" + getTypeNames(serviceCache,requestargs);

          // Adding CRS
          url += "&SRSNAME=" + getCRS(serviceCache, requestargs);

          // Adding bbox
          url += "&BBOX=" + getBbox(serviceCache, requestargs);

          // Adding format
          url += "&OUTPUTFORMAT=" + getOutputFormat(serviceConfiguration, serviceCache, requestargs);

        url += "&EXCEPTIONS=application/json"

        console.log("REQUEST URL");
        console.log(url);

        return url;

  } catch (error) {
          return error
  }
}

function getOutputFormat(serviceConfiguration, serviceCache, requestargs){
  return requestargs.params.format ? requestargs.params.format : "application/json";
}

function  getTypeNames(serviceCache,requestargs){
  return requestargs.params.featureId

};

function getCRS(serviceCache, requestargs){
  return requestargs.params.crs ? requestargs.params.crs : defaultCRS;
}



/**
 * If no bbox is requested, the maximum bbox will be returned.
 * Otherwise the parameter will be evaluated. If valid (within the maximum bbox) they will be returnes as a string.
 * Else an error will be thrown
 * @param  {Object}       serviceCache Capabilities of the requested service.
 * @param  {Object}       requestargs  The arguments from the requestargs
 * @return {String}                    Concatenation if minx,miny,maxx,maxy
 * @throws {Error}                     Otherwise        [description]
 */
function getBbox(serviceCache, requestargs) {
        "use strict";
        // If no bbox is given, return a default-bbox.
        // If no crs is given, use EPGS:4326
        // Otherwise use cooedinates in the given crs.
        // This is important, because images can be returned with a spatial reference.

        try {
                const defaultBbox = getdefaultBbox(serviceCache, requestargs);
                if (!requestargs.params.bbox) {
                        return defaultBbox;
                } else {
                  return requestargs.params.bbox

                }
        } catch (error) {
                throw error;
        }

}

/**
 * Returns a stringrepresentation of the bbox, which is maximum in extend.
 * If no crs is given: EPSG:4326
 * Otherwise and if the given crs is valid, coordinates in this system will be returned.
 * @param  {Object}       serviceCache Capabilities of the requested service.
 * @param  {Object}       requestargs  The arguments from the requestargs
 * @return {String}                    Concatenation if minx,miny,maxx,maxy
 * @throws {Error}                     Otherwise
 */
function getdefaultBbox(serviceCache, requestargs) {
        "use strict";
        try {
              console.log("getdefaultBbox");
                const maxBbox = features.getExGeographicBoundingBox(serviceCache);
                console.log("maxBbox " + maxBbox);
                if (!maxBbox) {
                  throw errorhandling.getError(500, "maxBbox", "getdefaultBbox", "Tried to get 'exGeographicBoundingBox'");
                }

                const targetCrs = getCRS(serviceCache, requestargs);

                if (targetCrs === "EPSG:4326") {
                        //then no transformation is needed, because maxBbox is given in EGPS:4326 via specification.
                        return "" + + maxBbox.westBoundLongitude + "," +maxBbox.southBoundLatitude + "," + maxBbox.eastBoundLongitude + "," + maxBbox.northBoundLatitude;
                } else {
                        // Targetsystem validation already happened in getCrs
                        const minis = coordinates.transformation(maxBbox.westBoundLongitude, maxBbox.southBoundLatitude, "EPSG:4326", targetCrs);
                        const maxis = coordinates.transformation(maxBbox.eastBoundLongitude, maxBbox.northBoundLatitude, "EPSG:4326", targetCrs);

                        return "" + minis.y + "," + minis.x + "," + maxis.y + "," + maxis.x;
                }

        } catch (error) {
                throw error;
        }

}

function getOutputFormat(serviceConfiguration, serviceCache, requestargs){
  return "application/json";
}
module.exports = {
  getCapabilities : getCapabilities,
  getFeature: getFeature
}
