const errorhandling = require("../general/errorhandling.js");

/**
 * Returns the offered layers and the max bbox (see getExGeographicBoundingBox).
 * @param  {Object}    serviceCache The WMS-cache
 * @param  {Object}    requestargs  Argument of the requests
 * @return {Object}                 JSON-Object
 */
function describeMap(serviceCache, requestargs, services) {
        // console.log(serviceCache);
        try {

                services.find(service => {
                        if (service.id == requestargs.params.id && service.capabilities.map.enabled === false) {
                                throw errorhandling.getError(404, "id not found", "describeMap", "Service with requested id is not supported");
                        }
                });


                const serviceCapabilities = serviceCache.find(service => {
                        return service.id == requestargs.params.id
                });
                const layers = getAllLayers(serviceCapabilities, requestargs);
                const crs = getExGeographicBoundingBox(serviceCapabilities);

                return {
                        "layers": layers,
                        "crs": crs
                };

        } catch (error) {
                return error;
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
function getExGeographicBoundingBox(capabilities) {
        try {
                const maxBbox = capabilities.capabilities.WMS_Capabilities.capability.layer.exGeographicBoundingBox;

                if (!maxBbox) {
                        throw errorhandling.getError("requestResponses", "badCapabilitiesAccess", "Tried to get 'exGeographicBoundingBox'");
                }
                // Adding missing Information
                maxBbox["crs"] = "EPSG:4326";
                return maxBbox;
        } catch (error) {
                throw errorhandling.getError("requestResponses", "getExGeographicBoundingBox", "Tried to get 'exGeographicBoundingBox'");
        }

}


/**
 * Returns an array with objects.
 * Each object describes one layer with 'name', 'title', 'href'
 * @param  {Object}     capabilities getCapabilites as a JSON-object
 * @param {Object}      requestargs Arguments of thr request
 * @return {Array}                  Array with the layer-objects
 */
function getAllLayers(capabilities, requestargs) {
        try {
                const layerCollection = [];
                capabilities.capabilities.WMS_Capabilities.capability.layer.layer.forEach(layer => {
                        const layerObject = {};
                        layerObject["id"] = layer.name;
                        layerObject["title"] = layer.title;
                        layerObject["href"] = requestargs.fullUrl + "/render?layer=" + layer.name;
                        layerCollection.push(layerObject);
                });
                return layerCollection;
        } catch (error) {
                throw errorhandling.getError(404, "map not supported", "getAllLayers", "Requested map is not supported.");
        }
}



module.exports = {
        getExGeographicBoundingBox: getExGeographicBoundingBox,
        describeMap: describeMap,
        getAllLayers: getAllLayers
}
