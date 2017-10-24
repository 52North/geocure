const generalURLConstructor = require("../general/url.js"),
        coordinates = require("../general/coordinates.js"),
        errorhandling = require("../general/errorhandling.js"),
        maps = require("./maps.js"),
        transformationParameters = require("../config/transformationParameter.js");

// Constants
const version = "1.3.0";
/**
 * version_getRequest is introduced to deal with with the current 1.3.0 request-problem with geoserver 2.10.0
 * @type {String}
 */
const version_getRequest = "1.3", // Do not touch the version again! Have a look: https://osgeo-org.atlassian.net/browse/GEOS-7889
        defaultCRS = "EPSG:4326",
        defaultBGcolor = "0xFFFFFF";
/**
 * Takes the URL of an service and creates the basic part for all requests.
 * Basic part consists of: the requested service ("wms") and the version.
 * @method getCapabilities
 * @param  {String}        serviceURL The Baseurl to the service
 * @return {String}                   The constructed url
 */
function getCapabilities(serviceURL) {
    "use strict";

    let url = generalURLConstructor.getBaseURL(serviceURL, ["wms", version]);
    console.log("wms.requestURL.js getCapabilities url: " + url);
    return url + "&REQUEST=getCapabilities";
}

function getPostGetMapURL(cacheWMS, requestargs, services) {
    "use strict";

    // Securing service
    const serviceConfiguration = services.find(service => {
        return service.id === requestargs.params.id;
    });


    if (!serviceConfiguration) {
        throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
    }

    if (!serviceConfiguration.capabilities.map.enabled) {
        throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
    }

    const serviceCache = cacheWMS.getCache().find(obj => {
        return obj.id === requestargs.params.id;
    });

    if (!serviceCache) {
        throw errorhandling.getError(500, "serviceCache", "getMapURL", "serviceCache not available");
    }

    try {

        let url = generalURLConstructor.getBaseURL(serviceConfiguration.url, ["wms", version_getRequest]);

        // Adding transparent
        url += "&TRANSPARENT=" + getTransparent(requestargs);
        return url;

    } catch (error) {
        throw error;
    }
}
;

function getPostGetMapXML(cacheWMS, requestargs, services) {
    "use strict";

    // // Securing service
    // const serviceConfiguration = services.find(service => {
    //     return service.id === requestargs.params.id;
    // });
    //
    //
    // if (!serviceConfiguration) {
    //     throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
    // }
    //
    // if (!serviceConfiguration.capabilities.map.enabled) {
    //     throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
    // }
    //
    // const serviceCache = cacheWMS.getCache().find(obj => {
    //     return obj.id === requestargs.params.id;
    // });
    //
    // if (!serviceCache) {
    //     throw errorhandling.getError(500, "serviceCache", "getMapURL", "serviceCache not available");
    // }
    //
    // // Create XML GetMap request object from param arguments:
    // var xmlObj = '<GetMap version= "'+ version_getRequest + '" xmlns:gml="http://www.opengis.net/gml">';
    //
    // // add CRS:
    // var epsg_code = '4326'; // default epsgcode
    // xmlObj += '<CRS>';
    // if (requestargs.params.crs) {
    //     epsg_code = requestargs.params.crs.substr(5, 4);
    //     console.log("epsgCode: " + epsg_code);
    // }
    // xmlObj += 'EPSG:' + epsg_code;
    // xmlObj += '</CRS>';
    //
    // // add BBox:
    // let bbx = getdefaultBbox(serviceCache, requestargs);
    // let splbx = bbx.split(',')
    // var x1 = splbx[0], // default BBox (i.e. max. Bbox)
    //         y1 = splbx[1],
    //         x2 = splbx[2],
    //         y2 = splbx[3];
    // xmlObj += '<BoundingBox srsName="http://www.opengis.net/gml/srs/epsg.xml#' + epsg_code + '">';
    // if (requestargs.params.bbox) {
    //     var coords = requestargs.params.bbox.split(',');
    //     x1 = coords[0];
    //     y1 = coords[1];
    //     x2 = coords[2];
    //     y2 = coords[3];
    // }
    // xmlObj += '<gml:coord><gml:X>' + x1 + '</gml:X>';
    // xmlObj += '<gml:Y>' + y1 + '</gml:Y></gml:coord>';
    // xmlObj += '<gml:coord><gml:X>' + x2 + '</gml:X>';
    // xmlObj += '<gml:Y>' + y2 + '</gml:Y></gml:coord>';
    // xmlObj += '</BoundingBox>';
    //
    // // add Output format:
    // var format = getFormat(serviceConfiguration, serviceCache, requestargs), // default format
    //         width = '600', // default width
    //         height = '400';     // default height
    //
    // width = getWidth(serviceConfiguration, requestargs);
    // height = getHeight(serviceConfiguration, requestargs);
    // xmlObj += '<Output>';
    // xmlObj += '<Format>';
    // xmlObj += format;
    // xmlObj += '</Format>';
    // xmlObj += '<Size><Width>' + width + '</Width>';
    // xmlObj += '<Height>' + height + '</Height></Size>';
    // xmlObj += '</Output>';

    // add SLD:
             // default style (none)
    if (requestargs.params.sld) {
        let sld_dec = decodeURIComponent(requestargs.params.sld);
        console.log("decodedSLD: " + sld_dec);
        return sld_dec;
    } else {
        return "";
    }
};

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
   "use strict";

   // Securing service
   const serviceConfiguration = services.find(service => {
       return service.id === requestargs.params.id;
   });


   if (!serviceConfiguration) {
       throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
   }

   if (!serviceConfiguration.capabilities.map.enabled) {
       throw errorhandling.getError(404, "Not Found", "getMapURL", "Service with requested id not found");
   }

   const serviceCache = cacheWMS.getCache().find(obj => {
       return obj.id === requestargs.params.id;
   });

   if (!serviceCache) {
       throw errorhandling.getError(500, "serviceCache", "getMapURL", "serviceCache not available");
   }

   // Adding Layers
   try {

       let url = generalURLConstructor.getBaseURL(serviceConfiguration.url, ["wms", version_getRequest]) + "&REQUEST=GetMap";

       url += "&LAYERS=" + getLayer(serviceCache, requestargs);
       // As no seperated styling is supported. So styles is empty to use default styling
       if (requestargs.params.styles)
           url += "&STYLES=" + requestargs.params.styles;
       //else
       //url += "&STYLES=";

       if (requestargs.params.sldbody)
           url += "&SLDBODY=" + requestargs.params.sldbody;

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

       url += "&BGCOLOR=" + getBGcolor(requestargs);

       // Exception
       url += "&EXCEPTIONS=json";

       return url;

   } catch (error) {
       throw error;
   }
}

/**
 * Returns the URL for a "getFeatureInfo request"
 * @method getFeatureInfo
 * @param {type} CacheWMS
 * @param {type} requestargs
 * @param {type} services
 * @returns {undefined}
 */
function getFeatureInfo(cacheWMS, requestargs, services) {
    "use strict";

    // Securing Service
    const serviceConfiguration = services.find(service => {
        return service.id === requestargs.params.id;
    });

    if (!serviceConfiguration) {
        throw errorhandling.getError(404, "Not Found", "getFeatureInfo", "Service with requested id not found");
    }

    if (!serviceConfiguration.capabilities.features.enabled) {
        throw errorhandling.getError(404, "Not Found", "getFeatureInfo", "Service with requested id not found");
    }

    const serviceCache = cacheWMS.getCache().find(obj => {
        return obj.id === requestargs.params.id;
    });

    try {
        const localVersion = '1.1.1'; // Needed as with 1.3.0 it seems not to work
        let url = generalURLConstructor.getBaseURL(serviceConfiguration.url, ["wms", localVersion]) + "&REQUEST=GetFeatureInfo";

        // Adding layers
        url += "&LAYERS=" + requestargs.params.layer;

        // As no seperated styling is supported. So styles is empty to use default styling
        // TODO: SUPPORT STYLES
        url += "&STYLES=";

        // Adding CRS
        url += "&CRS=" + getCRS(serviceCache, requestargs);

        // Adding format
        url += "&FORMAT=" + getFormat(serviceConfiguration, serviceCache, requestargs);

        // Adding bbox
        url += "&BBOX=" + getBbox(serviceCache, requestargs);

        // Adding width
        url += "&WIDTH=" + getWidth(serviceConfiguration, requestargs);

        // Adding height
        url += "&HEIGHT=" + getHeight(serviceConfiguration, requestargs);

        url += "&QUERY_LAYERS=" + requestargs.params.layer;


        if (requestargs.params.info_format) {
              url += "&INFO_FORMAT=" + requestargs.params.info_format;
        }
        else {
            url += "&INFO_FORMAT=application/json";
        }

        if (requestargs.params.feature_count) {
          url += "&FEATURE_COUNT=" + requestargs.params.feature_count;
        }

        if (requestargs.params.x) {
          url += "&X=" + requestargs.params.x;
        }

        if (requestargs.params.y) {
          url += "&Y=" + requestargs.params.y;
        }

        if (requestargs.params.buffer) {
          url += "&buffer=" + requestargs.params.buffer;
        }



        url += "&EXCEPTIONS=application/json";



        return url;

    } catch (error) {
        return error;
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
function getBGcolor(requestargs) {
    if (!requestargs.params.bgcolor) {
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
function getTransparent(requestargs) {
    if (!requestargs.params.transparent) {
        return false;
    }

    if (Boolean(requestargs.params.transparent)) {
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

    return requestargs.params.format ? requestargs.params.format : serviceConfiguration.capabilities.map.defaultvalues.format;

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
    return requestargs.params.width ? requestargs.params.width : serviceConfiguration.capabilities.map.defaultvalues.width;

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
    return requestargs.params.height ? requestargs.params.height : serviceConfiguration.capabilities.map.defaultvalues.height;
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

    let returnvalue = (requestargs.params.bbox ? requestargs.params.bbox : (getdefaultBbox(serviceCache, requestargs)));
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
      console.log("error: " + error);
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
    "use strict";
    if (!requestargs.params.crs) {
        return defaultCRS;
    } else {

        var supportedByTransformationParameter = transformationParameters.get().find(element => {
            return element[0] === requestargs.params.crs;
        });
        var supportedByGetCapabilities = serviceCache.capabilities.WMS_Capabilities.capability.layer.crs.find(element => {
            return element === requestargs.params.crs;
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
function getLayer(serviceCache, requestargs) {
    "use strict";

    // If no layers were given
    if (!requestargs.params.layer) {
        try {
            let supportedLayers = maps.getAllLayers(serviceCache, requestargs);
            let response = [];

            supportedLayers.forEach(layer => {
                response.push(layer.id);
            });

            return response.toString();
        } catch (error) {
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
    getFeatureInfo: getFeatureInfo,
    // getMapURL: getPostGetMapURL,
    getMapURL: getMapURL,
    getMapXML: getPostGetMapXML,
    getTransparent: getTransparent,
    getBGcolor: getBGcolor
}
