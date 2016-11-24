/**
 * Generates the base for all requests to an OGC WMS/WFS
 * @param  {String}    serviceURL To be completed url
 * @return {Generator}         Generator for the construction
 */

function* URLBaseGenerator(serviceURL) {
    let url = serviceURL + "?";
    let service = yield;
    url += "SERVICE=" + service;
    let version = yield;
    url += "&VERSION=" + version;
    yield url;
}


/**
 * Constructs for a given serviceURL and an array of arguments
 * the präfix for all requests.
 * @param  {[type]} serviceURL [description]
 * @param  {[type]} args       [description]
 * @return {[type]}            [description]
 */
function getBaseURL(serviceURL, args){

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
    getBaseURL : getBaseURL
}
