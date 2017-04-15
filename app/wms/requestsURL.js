const generalURLConstructor = require("../general/url.js");
const coordinates = require("../general/coordinates.js")
const errorhandling = require("../general/errorhandling.js");
const maps = require("./maps.js");
const transformationParameters = require("../config/transformationParameter.js");

// Constants
const version = "1.3.0";
/**
 * version_getRequest is introduced to deal with with the current 1.3.0 request-problem with geoserver 2.10.0
 * @type {String}
 */
const version_getRequest = "1.3"
const defaultCRS = "EPSG:4326"
const defaultBGcolor = "0xFFFFFF";
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
        console.log("wms.requestURL.js getCapabilities url: " + url);
        return url + "&REQUEST=getCapabilities";
}


/**
 * Returns the URL for a "getMap - request"
 * @method getMapURL
 * @param  {Object}   cacheWMS     The whole cache for WM-Services
 * @param  {Object}   requestargs  Arguments of the request
 * @param  {Array}    services      Array with all services
 * @return {String}               The URL
 * @throws {Object}                Otherwise
 */
function getMapURL(cacheWMS, requestargs, services) {
        "use strict"

        // Securing service
        const serviceConfiguration = services.find(service => {
                return service.id === requestargs.params.id
        });


        if (!serviceConfiguration){
          throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
        }

        if(!serviceConfiguration.capabilities.maps.enabled){
          throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
        }

        const serviceCache = cacheWMS.getCache().find(obj => {return obj.id === requestargs.params.id});

        if (!serviceCache){
          throw errorhandling.getError(500, "serviceCache", "getMapURL", "serviceCache not available");
        }

        // Adding Layers
        try {
                let url = generalURLConstructor.getBaseURL(serviceConfiguration.url, ["wms", version_getRequest]) + "&REQUEST=GetMap";

                url += "&LAYERS=" + getLayer(serviceCache,requestargs);
                // As no seperated styling is supported. So styles is empty to use default styling
                url += "&STYLES=";

                // Adding CRS
                url += "&CRS=" + getCRS(serviceCache, requestargs);

                // Adding bbox
                url += "&BBOX=" + getBbox(serviceCache, requestargs);

                // Adding width
                url += "&WIDTH=" + getWidth(serviceConfiguration, requestargs);

                // Adding height
                url += "&HEIGHT=" + getHeight(serviceConfiguration, requestargs);

                // Adding format
                url += "&FORMAT=" + getFormat(serviceConfiguration, serviceCache, requestargs);

                // Adding transparent
                url += "&TRANSPARENT=" + getTransparent(requestargs);

                url += "&BGCOLOR=" + getBGcolor(requestargs)

              // Exception
              url += "&EXCEPTIONS=json"


              return url;

        } catch (error) {
                throw error
        }
}




/**
 * If no BGcolor is in requestargs.params, then the global defaultColor will be returned.
 * Else the given color will be checked and returned, if valid - otherwise an error.
 * @method getBGcolor
 * @param  {Object}   requestargs RequestArguments
 * @return {String}               BGColorCode
 * @throws {Error}                Otherwise
 */
function getBGcolor(requestargs){
  if(!requestargs.params.bgcolor){
    return defaultBGcolor;
  }
  // if(/^0x([A-Fa-f0-9]{6})$/.test(requestargs.params.bgcolor)){
    return requestargs.params.bgcolor;
  // }
  // throw errorhandling.getError("requestResponses", "bgcolor");
}



/**
 * Returns an boolean.
 * True for transparent
 * False for not transparent
 * @param  {Object}       requestargs RequestArguments
 * @return {Boolean}                   see description
 * @throws {Error}                    Otherwise
 */
function getTransparent(requestargs){
  if(!requestargs.params.transparent){
    return false;
  }

  if(typeof requestargs.params.transparent === "boolean"){
      return requestargs.params.transparent;
    }

  //throw errorhandling.getError("requestResponses", "transparent");
}

/**
 * Returns a valid format for map-requests.
 * If no format is given, the default value in services.json will be checked and returned.
 * Otherwise the value for the format-argument will be checked.
 * @method getFormat
 * @param  {Object}  serviceConfiguration The configuration of the requested service (services.json)
 * @param  {Object}  serviceCache         The getCapabilities of the service
 * @param  {Object}  requestargs          The arguments of the request
 * @return {String}                       The format
 * @throws {Error}                        Otherwise
 */
function getFormat(serviceConfiguration, serviceCache, requestargs) {

return requestargs.params.format ? requestargs.params.format : serviceConfiguration.capabilities.maps.defaultvalues.format;

}

/**
 * If no width is given as request argument, the default width (services.json) will be checked and returned.
 * If a width is given, it will be checked and returned.
 * @param  {Object} serviceConfiguration The configuration of the current service
 * @param  {Object} requestargs          The requestarguments
 * @return {Number}                      The width
 * @throws {Error}                        Otherwise
 */
function getWidth(serviceConfiguration, requestargs) {
"use strict";
  return requestargs.params.width ? requestargs.params.width : serviceConfiguration.capabilities.maps.defaultvalues.width;

}
/**
 * If no height is given as request argument, the default height (services.json) will be checked and returned.
 * If a height is given, it will be checked and returned.
 * @param  {Object} serviceConfiguration The configuration of the current service
 * @param  {Object} requestargs          The requestarguments
 * @return {Number}                      The width
 * @throws {Error}                        Otherwise
 */
function getHeight(serviceConfiguration, requestargs) {
        "use  strict";
        return requestargs.params.height ? requestargs.params.height : serviceConfiguration.capabilities.maps.defaultvalues.height;
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
return requestargs.params.bbox ? requestargs.params.bbox : (getdefaultBbox(serviceCache, requestargs));
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
                const maxBbox = serviceCache.capabilities.WMS_Capabilities.capability.layer.exGeographicBoundingBox;

                if (!maxBbox) {
                        throw errorhandling.getError(500, "maxBbox", "getdefaultBbox", "Tried to get 'exGeographicBoundingBox'");
                }

                const targetCrs = getCRS(serviceCache, requestargs);

                if (targetCrs === "EPSG:4326") {
                        //then no transformation is needed, because maxBbox is given in EGPS:4326 via specification.
                        return "" + maxBbox.westBoundLongitude + "," + maxBbox.southBoundLatitude + "," + maxBbox.eastBoundLongitude + "," + maxBbox.northBoundLatitude;
                } else {
                        // Targetsystem validation already happened in getCrs
                        const minis = coordinates.transformation(maxBbox.westBoundLongitude, maxBbox.southBoundLatitude, "EPSG:4326", targetCrs);
                        const maxis = coordinates.transformation(maxBbox.eastBoundLongitude, maxBbox.northBoundLatitude, "EPSG:4326", targetCrs);

                        return "" + minis.x + "," + minis.y + "," + maxis.x + "," + maxis.y;
                }

        } catch (error) {
                throw error;
        }

}


/**
 * @param  {Object} serviceCache Object describing the Capabilities of a service (JSON)
 * @param  {Object} requestargs  Arguments of the request
 * @return {String}              EPSG Code of a crs
 * @throws {Error}               Otherwise
 */
function getCRS(serviceCache, requestargs) {
        "use strict"
        if (!requestargs.params.crs) {
                return defaultCRS;
        } else {

                var supportedByTransformationParameter = transformationParameters.get().find(element => {
                        return element[0] === requestargs.params.crs
                })
                var supportedByGetCapabilities = serviceCache.capabilities.WMS_Capabilities.capability.layer.crs.find(element => {
                        return element === requestargs.params.crs
                });

                if (supportedByTransformationParameter && supportedByGetCapabilities) {
                        return requestargs.params.crs;
                } else {
                        throw errorhandling.getError(404, "invalid CRS", "getCRS", "The requested is not supported");
                }
        }
}



/**
 * Returns all valid layers for requestargs.
 * If no layer were specified in requestargs.params.layer, all layers will be returned.
 * Otherwise the specified layers will be checked and returned.
 * @method getLayer
 * @param  {Object} serviceCache getCapabilities for the wms
 * @param  {Object} requestargs  requestarguments
 * @return {String}              Comma-separated string of layers
 * @throws {Error}               Otherwiese
 */
function getLayer(serviceCache,requestargs){
  "use strict";

  // If no layers were given
  if(!requestargs.params.layer){
    try{
      let supportedLayers = maps.getAllLayers(serviceCache, requestargs);
      let response = [];

      supportedLayers.forEach(layer => {
        response.push(layer.id);
      })

      return response.toString();
    }
    catch (error){
      throw error;
    }
  }

  return requestargs.params.layer;
}

module.exports = {
        getCapabilities: getCapabilities,
        getCRS: getCRS,
        getdefaultBbox: getdefaultBbox,
        getBbox: getBbox,
        getWidth: getWidth,
        getHeight: getHeight,
        getFormat: getFormat,
        getMapURL: getMapURL,
        getTransparent: getTransparent,
        getBGcolor: getBGcolor
}
