const errorhandling = require("../general/errorhandling.js");

function describeFeatures(serviceCache, requestargs, services) {
        try {

                services.find(service => {
                        if (service.id == requestargs.params.id && service.capabilities.features.enabled === false) {
                                throw errorhandling.getError(404, "id not found", "describeFeatures", "Service with requested id is not supported");
                        }
                });

                const serviceCapabilities = serviceCache.find(service => {
                        return service.id == requestargs.params.id
                });
                const layers = getAllFeatures(serviceCapabilities, requestargs);
                const crs = getExGeographicBoundingBox(serviceCapabilities);
                return {
                        "features": layers,
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
                const maxBbox = getExtremeBbox(capabilities);
                const response = {};
                response["TYPE_NAME"] = capabilities.capabilities.value.featureTypeList.featureType[0].TYPE_NAME;
                response["westBoundLongitude"] = maxBbox.westBoundLongitude;
                response["eastBoundLongitude"] = maxBbox.eastBoundLongitude;
                response["southBoundLatitude"] = maxBbox.southBoundLatitude;
                response["northBoundLatitude"] = maxBbox.northBoundLatitude;
                response["crs"] = "EPSG:4326";

                return response;
        } catch (error) {
                throw errorhandling.getError(500, "bbox error", "getExGeographicBoundingBox", "Error while getting 'exGeographicBoundingBox'");
        }

}


function getExtremeBbox(capabilities) {

        try {
                const extremCorners = initializeMaxBbox(capabilities);

                //console.log(capabilities.capabilities.value.featureTypeList.featureType);
                capabilities.capabilities.value.featureTypeList.featureType.forEach(feature => {
                        //const featureWGS84Bbox = feature.wgs84BoundingBox;
                        extremCorners["westBoundLongitude"] > feature.wgs84BoundingBox[0].lowerCorner[0] ? extremCorners["westBoundLongitude"] = feature.wgs84BoundingBox[0].lowerCorner[0] : extremCorners["westBoundLongitude"];
                        extremCorners["eastBoundLongitude"] < feature.wgs84BoundingBox[0].upperCorner[0] ? extremCorners["eastBoundLongitude"] = feature.wgs84BoundingBox[0].upperCorner[0] : extremCorners["eastBoundLongitude"];
                        extremCorners["southBoundLatitude"] > feature.wgs84BoundingBox[0].lowerCorner[1] ? extremCorners["southBoundLatitude"] = feature.wgs84BoundingBox[0].lowerCorner[1] : extremCorners["southBoundLatitude"];
                        extremCorners["northBoundLatitude"] < feature.wgs84BoundingBox[0].upperCorner[1] ? extremCorners["northBoundLatitude"] = feature.wgs84BoundingBox[0].upperCorner[1] : extremCorners["northBoundLatitude"];
                });

                return extremCorners;

        } catch (error) {
                throw error;
        }
}

function initializeMaxBbox(capabilities) {
        const firstFeatureCoordinates = {};
        try {
                const maxBbox = capabilities.capabilities.value.featureTypeList.featureType[0].wgs84BoundingBox;

                firstFeatureCoordinates["westBoundLongitude"] = maxBbox[0].lowerCorner[0];
                firstFeatureCoordinates["eastBoundLongitude"] = maxBbox[0].upperCorner[0];
                firstFeatureCoordinates["southBoundLatitude"] = maxBbox[0].lowerCorner[1];
                firstFeatureCoordinates["northBoundLatitude"] = maxBbox[0].upperCorner[1];

                //console.log("firstFeatureCoordinates = " + JSON.stringify(firstFeatureCoordinates));
                return firstFeatureCoordinates;
        } catch (error) {
                throw errorhandling.getError(500, "bbox error", "initializeMaxBbox", "Error while getting 'initializeMaxBbox'");
        }

}


/**
 * Returns an array with objects.
 * Each object describes one layer with 'name', 'title', 'href'
 * @param  {Object}     capabilities getCapabilites as a JSON-object
 * @param {Object}      requestargs Arguments of thr request
 * @return {Array}                  Array with the layer-objects
 */
function getAllFeatures(capabilities, requestargs) {

        try {
                const layerCollection = [];
                capabilities.capabilities.value.featureTypeList.featureType.forEach(feature => {
                        const layerObject = {};
                        layerObject["id"] = feature.name.localPart;
                        layerObject["title"] = feature.title[0].value;
                        layerObject["href"] = requestargs.fullUrl + "/" + feature.name.localPart + "/data";;
                        layerCollection.push(layerObject);
                });
                //console.log(layerCollection.length)
                return layerCollection;
        } catch (error) {
                throw errorhandling.getError(404, "Bad feature request", "getAllFeatures", "Requested feature is not supported");
        }
}


module.exports = {
        describeFeatures: describeFeatures,
        getExGeographicBoundingBox: getExGeographicBoundingBox
}
