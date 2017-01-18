const requestsURL = require("./requestsURL.js");
const services = require("../config/services.json");
const Jsonix = require("jsonix").Jsonix;
const errorhandling = require("../general/errorhandling.js");


// let and not const so it can be cleared by cache = []
let cache = [];
let requestURLs = [];

// Status. true if ready, otherwise false
let ready = false;


/**
 * Interface to return the cache (Array with objects, which describe the capabilities of the oddered services)
 * @method getCache
 * @return {Array} The cache
 * @throws {Error} If one tries to obtain the cache, but it is not ready, one gets an "wmsCacheNotReady"-Error
 */
function getCache() {
        "use strict";
        return (ready ? cache : (errorhandling(500, "cache not ready", "getCache", "wfsCache not ready")));
}

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
                        if (currentObject.capabilities.features.enabled && currentObject.id) {

                                const capabilitiesRequestParameters = {
                                        "id": currentObject["id"],
                                        "capabilitiesURL": requestsURL.getCapabilities(currentObject.url)
                                };

                                getCapabilitiesURL.push(capabilitiesRequestParameters);
                        }
                } catch (error) {
                        throw error;
                }
        });

        return getCapabilitiesURL;
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
                requestURLs = [];
                requestURLs = loadCapabilitiesURLs();
                try{
                  async(getCapabilitiesGenerator, resolve);

                }
                catch(error){
                  reject(error);
                }
        });
}


/**
 * Generator for requests to services, which stores the result in the array 'cache'.
 * @return {Iterator} Iterator
 */
function* getCapabilitiesGenerator() {
        "use strict";
        let count = 0;
        while (count < requestURLs.length) {
                let capabilities = yield getJSON_WFS(requestURLs[count]["capabilitiesURL"]);
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


/**
 * Handles asynchrone requests based on generators
 * @param  {Generator} generator Generator with the urls to request
 */
function async(generator, resolve) {
        "use strict";
        const iterator = generator();

        function handle(iteratorResult) {
                if (iteratorResult.done) {
                  resolve();
                  return;
                }

                let iteratorValue = iteratorResult.value;
                if (iteratorValue instanceof Promise) {
                        iteratorValue.then(res => handle(iterator.next(res)))
                                .catch(error => {
                                        throw (error)
                                })
                };
        }

        try {
                handle(iterator.next());
        } catch (error) {
                iterator.throw(error);
        }
}




const WFS_2_0 = require("ogc-schemas").WFS_2_0;
const OWS_1_1_0 = require("ogc-schemas").OWS_1_1_0;
const Filter_2_0 = require("ogc-schemas").Filter_2_0;
const XLink_1_0 = require("w3c-schemas").XLink_1_0;


function getJSON_WFS(getCapabilitiesUrl) {
    'use strict';
    return new Promise((resolve, reject) => {
        try {

            // Create a Jsonix context
            var context = new Jsonix.Context([XLink_1_0, Filter_2_0, OWS_1_1_0, WFS_2_0]);

            // Create an unmarshaller (parser)
            var unmarshaller = context.createUnmarshaller();

            // Unmarshal from URL
            unmarshaller.unmarshalURL(getCapabilitiesUrl, function(result) {
                 resolve(result);
                //console.log(JSON.stringify(result, null, 4));
            });

        } catch (error) {
            reject(error);
        }
    });
}

// var context = new Jsonix.Context([XLink_1_0, Filter_2_0, OWS_1_1_0, WFS_2_0], {
//     namespacePrefixes: {
//         "http://www.opengis.net/wfs": "",
//         "http://www.w3.org/1999/xlink": "xlink"
//     },
//     mappingStyle: "simplified"
// });


module.exports = {
  loadCache: loadCache,
  getCache: getCache
}
