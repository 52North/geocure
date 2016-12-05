const generalURLConstructor = require("../general/url.js");
const coordinates = require("../general/coordinates.js")
const errorhandling = require("../general/errorhandling.js");
const maps = require("./maps.js");
const transformationParameters = require("../config/transformationParameter.js");

// Constants
const version = "1.1.1";
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




function getMapURL(cacheWMS, requestargs, services) {
        "use strict"

        const serviceConfiguration = services.find(service => {
                return service.id === requestargs.id
        });

        //TODO: Damit, für ein service welcher später von enabled = true auf false gesetzt wurde nicht mehr zugegruffen werden kann,
        //Hier überprüfen, ob der service enabled ist. Wenn nicht, dann Fehler zurück gegben!!!!

        if (!serviceConfiguration){
          throw errorhandling.getError("services", "id", ("id = " + requestargs.id));
        }

        const serviceCache = cacheWMS.find(obj => {return obj.id === requestargs.id});
        if (!serviceCache){
          throw errorhandling.getError("services", "serviceCache");
        }


        let url = generalURLConstructor.getBaseURL(serviceConfiguration.url, ["wms", version]) + "&REQUEST=GetMap";

        // Adding Layers
        try {
                layerValid(serviceCache, requestargs);
                url += "&LAYERS=" + requestargs.layer;
        } catch (error) {
                throw error
        }

        // As no seperated styling is supported. So styles is empty to use default styling
        url += "&STYLES=";

        // Adding CRS
        try {
                url += "&CRS=" + getCRS(serviceCache, requestargs);
        } catch (error) {
                throw error;
        }


        // Adding bbox

        try {
                url += "&BBOX=" + getBbox(serviceCache, requestargs);
        } catch (error) {
                throw error;
        }

        // Adding width

        try {
                url += "&WIDTH=" + getWidth(serviceConfiguration, requestargs);
        } catch (error) {
                throw error;
        }

        // Adding height
        try {
                url += "&HEIGHT=" + getHeight(serviceConfiguration, requestargs);
        } catch (error) {
                throw error;
        }

        try{
          url += "&FORMAT=" + getFormat(serviceConfiguration, serviceCache, requestargs);
        }
        catch (error){
          throw error;
        }

        try{
          url += "&TRANSPARENT=" + getTransparent(requestargs);
        }
        catch(error)
        {
          throw error;
        }



        return url;
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
  if(!requestargs.transparent){
    return false;
  }
  else{
    if(typeof requestargs.transparent === "boolean"){
      return requestargs.transparent;
    }
  }
  throw errorhandling.getError("requestResponses", "transparent");
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
        try {
                const supportedFormats = serviceCache.capabilities.WMS_Capabilities.capability.request.getMap.format;

                // No format requested;
                if (!requestargs.format) {

                        const defaultFormat = serviceConfiguration.capabilities.maps.defaultvalues.format;

                        const formatValid = supportedFormats.find(format => {
                                return format === defaultFormat;
                        });


                        if (formatValid) {
                                return defaultFormat;
                        } else {
                                throw errorhandling.getError("services", "format", ("format = " + defaultFormat));
                        }
                }

                // Format requested
                else {
                  const requestedFormat = decodeURI(requestargs.format);

                  const formatValid = supportedFormats.find(format => {
                          return format === requestedFormat;
                  });

                  if (formatValid) {
                          return requestedFormat;
                  } else {
                          throw errorhandling.getError("services", "format", ("format = " + requestedFormat));
                  }
                }

        } catch (error) {
          throw error;
        }
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
        try {
                if (!requestargs.width) {
                        const defaultWidth = serviceConfiguration.capabilities.maps.defaultvalues.width;
                        // If no width is given in the request
                        if (typeof defaultWidth === "number" && defaultWidth > 0) {
                                return defaultWidth;
                        } else {
                                throw errorhandling.getError("services", "width", ("width = " + defaultWidth));
                        }
                }

                // If width is given.
                if (typeof requestargs.width != "number" || requestargs.width < 0) {
                        throw errorhandling.getError("services", "width", ("width = " + requestargs.width));
                } else {
                        return requestargs.width;
                }
        } catch (error) {
                throw error;
        }
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
        try {
                if (!requestargs.height) {
                        const defaultHeight = serviceConfiguration.capabilities.maps.defaultvalues.height;
                        // If no height is given in the request
                        if (typeof defaultHeight === "number" && defaultHeight > 0) {
                                return defaultHeight;
                        } else {
                                throw errorhandling.getError("services", "height", ("height = " + defaultHeight));
                        }
                }

                // If height is given.
                if (typeof requestargs.height != "number" || requestargs.height < 0) {
                        throw errorhandling.getError("services", "height", ("height = " + requestargs.height));
                } else {
                        return requestargs.height;
                }
        } catch (error) {
                throw error;
        }
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

                if (!requestargs.bbox) {
                        return defaultBbox;
                } else {
                        const defaultBboxArray = defaultBbox.split(",");
                        const givenCoordinatesArray = requestargs.bbox.split(",");

                        const validRequstedBbox = givenCoordinatesArray[0] >= defaultBboxArray[0] && givenCoordinatesArray[1] >= defaultBboxArray[1] && givenCoordinatesArray[2] <= defaultBboxArray[2] && givenCoordinatesArray[3] <= defaultBboxArray[3];

                        if (!validRequstedBbox) {
                                throw errorhandling.getError("requestResponses", "bbox");
                        }

                        return requestargs.bbox
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
                const maxBbox = serviceCache.capabilities.WMS_Capabilities.capability.layer.exGeographicBoundingBox;

                if (!maxBbox) {
                        throw errorhandling.getError("requestResponses", "badCapabilitiesAccess", "Tried to get 'exGeographicBoundingBox'");
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
 * If no CRS is given in the requestarguments, a default CRS will be returned
 * If crs is a requestargument, it will be checked against the crs in the getCapabilities
 * and transformationParameter.js. If everything is ok, the crs will be returned,
 * otherwise an error will be thrown.
 * @param  {Object} serviceCache Object describing the Capabilities of a service (JSON)
 * @param  {Object} requestargs  Arguments of the request
 * @return {String}              EPSG Code of a crs
 * @throws {Error}               Otherwise
 */
function getCRS(serviceCache, requestargs) {
        "use strict"
        if (!requestargs.crs) {
                return defaultCRS;
        } else {

                var supportedByTransformationParameter = transformationParameters.get().find(element => {
                        return element[0] === requestargs.crs
                })
                var supportedByGetCapabilities = serviceCache.capabilities.WMS_Capabilities.capability.layer.crs.find(element => {
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
 * Checks the layer, given as a queryparameter, whether they are valid
 * @param  {Object}   capabilities Cache of the WMS-getCapabilities
 * @param  {Object}   requestargs  Arguments of the request
 * @return {Boolean}               If everything is ok
 * @throws {Exception}             Esle
 */
function layerValid(capabilities, requestargs) {
        "use strict"

        // We need at least one layer for a request
        if (requestargs.layer === "undefined") {
                throw errorhandling.getError("requestResponses", "badLayerRequest", "No layer was given.");
        }

        // Are all requested layer supported?
        var requestedLayers = requestargs.layer.split(",");


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
        layerValid: layerValid,
        getCRS: getCRS,
        getdefaultBbox: getdefaultBbox,
        getBbox: getBbox,
        getWidth: getWidth,
        getHeight: getHeight,
        getFormat: getFormat,
        getMapURL: getMapURL
}
