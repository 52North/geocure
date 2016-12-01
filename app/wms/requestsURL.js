const generalURLConstructor = require("../general/url.js");
const errorhandling = require("../general/errorhandling.js");
const maps = require("./maps.js");

// Constants
const version = "1.3.0";

/**
 * Takes the URL of an service and creates the basic part for all requests.
 * Basic part consists of: the requested service ("wms") and the version.
 * @method getCapabilities
 * @param  {String}        serviceURL The Baseurl to the service
 * @return {String}                   The constructed url
 */
function getCapabilities(serviceURL) {
        let url = generalURLConstructor.getBaseURL(serviceURL, ["wms", version]);
        return url + "&REQUEST=getCapabilities";
}



function getMap(serviceURL, requestargs) {
        let baseURL = generalURLConstructor.getBaseURL(serviceURL, ["wms", version]) + "&REQUEST=GetMap";


}




function* GetMapURLGenerator(baseURL, requestargs) {
        let url = baseURL;
        let layers = yield;
        //TODO Validate layer and construct url

}



/**
 * Checks the layers, given as a queryparameter, whether they are valid
 * @param  {Object}   serviceCache Cache of the WMS-getCapabilities
 * @param  {Object}   requestargs  Arguments of the request
 * @return {Boolean}               If everything is ok
 * @throws {Exception}             Esle
 */
function layerValid(serviceCache, requestargs) {
        // We need at least one layer for a request
        if (requestargs.layers === "undefined") {
                throw errorhandling.getError("requestResponses", "badLayerRequest", "No layer was given.");
        }

        // Are all requested layers supported?
        var requestedLayers = requestargs.layers.split(",");

        // As the result is constructed from the getCapabilities, it can be used to validate the layer request
        let supportedLayers = maps.getAllLayers(serviceCache, requestargs);

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
        layerValid: layerValid
}
