const Jsonix = require("jsonix").Jsonix;
const XLink_1_0 = require("w3c-schemas").XLink_1_0;
const WMS_1_3_0 = require("ogc-schemas").WMS_1_3_0;

/**
 * Returns a Promise, which requests for a given url
 * a xml-file and generates a JSON-Format of the content, which will be returned
 * @param  {String} getCapabilitiesUrl   The url for the requests
 * @return {Promise}                     Promise which performes the request
 */
function getJSON_WMS(getCapabilitiesUrl) {
    'use strict';
    return new Promise((resolve, reject) => {
        try {

            // Create a Jsonix context
            var context = new Jsonix.Context([XLink_1_0, WMS_1_3_0], {
                namespacePrefixes: {
                    "http://www.opengis.net/wms": "",
                    "http://www.w3.org/1999/xlink": "xlink"
                },
                mappingStyle: "simplified"
            });

            // Create an unmarshaller (parser)
            var unmarshaller = context.createUnmarshaller();

            // Unmarshal from URL
            unmarshaller.unmarshalURL(getCapabilitiesUrl, function(result) {
                resolve(result);
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getJSON_WMS: getJSON_WMS
}
