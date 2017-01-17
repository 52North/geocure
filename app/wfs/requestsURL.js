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
    throw errorhandling.getError("services", "id", ("id = " + requestargs.params.id));
  }

  if(!serviceConfiguration.capabilities.features.enabled){
    throw errorhandling.getError("services", "id", ("id = " + requestargs.params.id));
  }


  const serviceCache = cacheWFS.getCache().find(obj => {return obj.id === requestargs.params.id});

  if (!serviceCache){
    throw errorhandling.getError("services", "serviceCache");
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

        // Exception
        // //TODO: Exception als JSON zurück gegebn können.
        url += "&EXCEPTIONS=application/json"

        console.log("REQUEST URL");
        console.log(url);

        return url;

  } catch (error) {
          throw error
  }
}

function getOutputFormat(serviceConfiguration, serviceCache, requestargs){
  if(!requestargs.params.format){
    return "application/json";
  }


}

function  getTypeNames(serviceCache,requestargs){
  return requestargs.params.featureId

};

function getCRS(serviceCache, requestargs){
  if(requestargs.params.crs){
    return requestargs.params.crs;
  }
  return "EPSG:4326";
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
                console.log("getBbox")
                const defaultBbox = getdefaultBbox(serviceCache, requestargs);
                console.log("defaultBbox = " + defaultBbox);
                if (!requestargs.params.bbox) {
                  console.log("!requestargs.params.bbox")
                        return defaultBbox;
                } else {
                        const defaultBboxArray = defaultBbox.split(",");
                        console.log(defaultBboxArray)
                        const givenCoordinatesArray = requestargs.params.bbox.split(",");

                        const validRequstedBbox = givenCoordinatesArray[0] >= defaultBboxArray[0] &&
                                                  givenCoordinatesArray[1] >= defaultBboxArray[1] &&
                                                  givenCoordinatesArray[2] <= defaultBboxArray[2] &&
                                                  givenCoordinatesArray[3] <= defaultBboxArray[3] &&
                                                  givenCoordinatesArray[0] < givenCoordinatesArray[2] &&
                                                  givenCoordinatesArray[1] <   givenCoordinatesArray[3];

                        if (!validRequstedBbox) {
                                throw errorhandling.getError("requestResponses", "bbox");
                        }

                        return requestargs.params.bbox;
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
                        throw errorhandling.getError("requestResponses", "badCapabilitiesAccess", "Tried to get 'exGeographicBoundingBox'");
                }

                const targetCrs = getCRS(serviceCache, requestargs);

                if (targetCrs === "EPSG:4326") {
                        //then no transformation is needed, because maxBbox is given in EGPS:4326 via specification.
                        return "" + maxBbox.southBoundLatitude + "," + maxBbox.westBoundLongitude + "," + maxBbox.northBoundLatitude + "," + maxBbox.eastBoundLongitude;
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
