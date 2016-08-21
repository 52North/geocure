/**
This library deals with documents in XML-format.
In our context, these are getCapabilities.
 **/

// Signatur: unmarshallXML : url callback ->
// Description: Takes the url to an XML (for instance GetCapabilities) and creates a JSON from it. A callback-function is then executed on the JSON.

// Dependencies for XML-Parsing
var Jsonix = require("jsonix").Jsonix;
// Check whether all needed!
var XLink_1_0 = require("w3c-schemas").XLink_1_0;
var WMS_1_1_1 = require("ogc-schemas").WMS_1_1_1;
var OWS_1_1_0 = require("ogc-schemas").OWS_1_1_0;
var WPS_1_0_0 = require("ogc-schemas").WPS_1_0_0;
var WMS_1_3_0 = require("ogc-schemas").WMS_1_3_0;
// ENDE Denpendencies for XML-Parsion

function unmarshallXML(url, callback) {
    console.log("At function unmarshallXML()");
    var getCapabilitiesUrl = url;
    var context = new Jsonix.Context([XLink_1_0, WMS_1_3_0], {
        namespacePrefixes: {
            "http://www.opengis.net/wms": "",
            "http://www.w3.org/1999/xlink": "xlink"
        },
        mappingStyle: "simplified"
    });

    var unmarshaller = context.createUnmarshaller();
    unmarshaller.unmarshalURL(getCapabilitiesUrl, function(result) {
        console.log("Finishing function unmarshallXML()");
        callback(result);
    });
}

module.exports = {
  unmarshallXML : unmarshallXML
}
