const generalURLConstructor = require("../general/url.js");
const coordinates = require("../general/coordinates.js")
const transformationParameters = require("../config/transformationParameter.js");

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

module.exports = {
  getCapabilities : getCapabilities
}
