const services = require("../config/services.json");
const requestsURL = require("./requestsURL.js");
const async = require("../general/asyncrone.js");
const getCapabilities = require("../general/getCapabilities.js");
const errorhandling = require("../general/errorhandling.js");

/**
 * Stores the getCapabilities [JSON]
 * @type {Array}
 */
let cache = [];
let requestURLs = [];

/**
 * Indicates whether loadingprocess of the cache finished.
 * @type {Boolean}
 */
let ready = false;

/**
 * Interface to return the cache (Array with objects, which describe the capabilities of the oddered services)
 * @method getCache
 * @return {Array} The cache
 * @throws {Error} If one tries to obtain the cache, but it is not ready, one gets an "wmsCacheNotReady"-Error
 */
function getCache() {
        "use strict";
        return (ready ? cache : (errorhandling("services", "wmsCacheNotReady")));
}


/**
 * Function which conduct the loading of the cache
 * @return {Boolean}  Will be returned, if the loading finished.
 */
function loadCache() {
        "use strict";

        return new Promise((resolve, reject) => {
                /**
                 * Make shure the array is empty, so no multiple entries exists for one service
                 * @type {Array}
                 */
                cache = [];
                requestURLs = loadCapabilitiesURLs();
                console.log("h")
                console.log("requestURLs.length = " + requestURLs.length);
                async.async(getCapabilitiesGenerator, resolve());
        });

}

/**
 * The following functions serve loadCache()
 */

/**
 * Constructs an array which contains the getCapabilitie urls for enabled map-services (enabled in services.json)
 * These urls are used to performe the asynchrone request to load the cache.
 * @return {Array} The getCapabilitie urls
 */
function loadCapabilitiesURLs() {
        "use strict";
        const getCapabilitiesURL = [];
        services.forEach(currentObject => {
                try {
                        if (currentObject["capabilities"]["maps"]["enabled"] && currentObject["id"]) {
                                const capabilitiesRequestParameters = {
                                        "id": currentObject["id"],
                                        "capabilitiesURL": requestsURL.getCapabilities(currentObject["url"])

                                };
                                getCapabilitiesURL.push(capabilitiesRequestParameters);
                        }
                } catch (error) {
                        console.log("Error in loadURLS :" + error);
                }
        });

        return getCapabilitiesURL;
}


/**
 * Generator for requests to services, which stores the result in the array 'cache'.
 * @return {Iterator} Iterator
 */
function* getCapabilitiesGenerator() {
        "use strict";
        let count = 0;
        while (count < requestURLs.length) {
          console.log("WMS getCapabilities");
                let capabilities = yield getCapabilities.getJSON_WMS(requestURLs[count]["capabilitiesURL"]);
                cache.push({
                        "id": requestURLs[count]["id"],
                        "capabilities": capabilities
                });

                /**
                 * log for tests
                 */
                // console.log(JSON.stringify({
                //         "id": requestURLs[count]["id"],
                //         "capabilities": capabilities
                // }));
                ++count;
        }
        ready = true;
}

module.exports = {
        loadCache: loadCache,
        getCache: getCache
}
