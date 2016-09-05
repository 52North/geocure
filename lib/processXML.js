/**
This library deals with documents in XML-format.
In our context, these are getCapabilities.
 **/



// Dependencies for XML-Parsing
var Jsonix = require("jsonix").Jsonix;
// Check whether all needed!
var XLink_1_0 = require("w3c-schemas").XLink_1_0;
var WMS_1_0_0 = require("ogc-schemas").WMS_1_0_0;
var WMS_1_1_0 = require("ogc-schemas").WMS_1_1_0;
var WMS_1_1_1 = require("ogc-schemas").WMS_1_1_1;
var WMS_1_3_0 = require("ogc-schemas").WMS_1_3_0;

var WFS_1_0_0 = require("ogc-schemas").WFS_1_0_0
var WFS_1_1_0 = require("ogc-schemas").WFS_1_1_0;
var WFS_2_0 = require("ogc-schemas").WFS_2_0;

var WPS_1_0_0 = require("ogc-schemas").WPS_1_0_0;

var GML_2_1_2 = require("ogc-schemas").GML_2_1_2;
var GML_3_1_1 = require("ogc-schemas").GML_3_1_1;
var GML_3_1_1 = require("ogc-schemas").GML_3_1_1;

var OWS_1_1_0 = require("ogc-schemas").OWS_1_1_0;
var OWS_1_0_0 = require("ogc-schemas").OWS_1_0_0;

var Filter_1_1_0 = require("ogc-schemas").Filter_1_1_0;

var SMIL_2_0_Language = require("ogc-schemas").SMIL_2_0_Language;
var SMIL_2_0 = require("ogc-schemas").SMIL_2_0;

// ENDE Denpendencies for XML-Parsion


/**
Signature: unmarshallXML : String, function

Description: Takes a URL (String), requests the URL and performes the passed function on the request-result.
The request-result is JSON structure which was previously XML
**/
function unmarshallXML(url, callback) {
    console.log("At function unmarshallXML()");
    var getCapabilitiesUrl = url;
    // WMS_1_3_0 is used for the WMS Everything after this is for the WFS
    var context = new Jsonix.Context([XLink_1_0, WMS_1_3_0, GML_2_1_2, Filter_1_1_0, GML_3_1_1, OWS_1_0_0, SMIL_2_0, SMIL_2_0_Language, WFS_1_1_0], {
        // namespacePrefixes: {
        //     "http://www.opengis.net/wms": "wms",
        //     "http://www.opengis.net/wf": "wfs",
        //     "http://www.w3.org/1999/xlink": "xlink"
        // },
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
