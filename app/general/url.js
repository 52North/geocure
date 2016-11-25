/**
 * Generates the base for all requests to an OGC WMS/WFS
 * @param  {String}    serviceURL To be completed url
 * @return {Iterator}         Iterator for the url construction
 */

function* URLBaseGenerator(serviceURL) {
        let url = serviceURL;
        let service = yield;
        url += "/" + service + "?SERVICE=" + service;
        let version = yield;
        url += "&VERSION=" + version;
        yield url;
}


/**
 * Constructs for a given service url and an array of arguments
 * the präfix for all requests.
 * @param  {String} serviceURL The service base url
 * @param  {Array} args       Arguments for the constuction [service, version]
 * @return {String}           The constructed url
 */
function getBaseURL(serviceURL, args) {
        "use strict";
        const urlIterator = URLBaseGenerator(serviceURL);
        // Initial call so we can pass arguments via next()
        urlIterator.next();
        let url;
        args.forEach(currentValue => {
                url = urlIterator.next(currentValue).value;
        });
        return url;
}


module.exports = {
        URLBaseGenerator: URLBaseGenerator,
        getBaseURL: getBaseURL
}
