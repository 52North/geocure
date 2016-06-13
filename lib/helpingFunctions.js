// Signatur: verifyObjectId : json objectID -> Object
// Description: Consumes a JSON (json) and a string (objectID) and returns an Object which attributes represent the result.
// result[0] contains a BOOLEAN which indicates whether the id was found in the json.
// result[1] contains the object, with the id or NULL.

function getKeyValueObject(json, key, value) {

    var result = {keyFound: false, object: null};

    for (var i = 0; i < json.length; i++) {
        if (key in json[i]) {
            if (json[i][key] == value) {
              result.keyFound = true;
              result.object = json[i];
              i = json.length; // found object, so no further iteration required.
            }
        }
    }
    return result;
}




// Signatur: unmarshallXML : url callback ->
// Description: Takes the url to an XML (for instance GetCapabilities) and creates a JSON from it. A callback-function is then executed on the JSON.

// Dependencies for XML-Parsing
var Jsonix = require('jsonix').Jsonix;
// Check whether all needed!
var XLink_1_0 = require('w3c-schemas').XLink_1_0;
var WMS_1_1_1 = require('ogc-schemas').WMS_1_1_1;
var OWS_1_1_0 = require('ogc-schemas').OWS_1_1_0;
var WPS_1_0_0 = require('ogc-schemas').WPS_1_0_0;
// ENDE Denpendencies for XML-Parsion

function unmarshallXML(url, callback1) {
    var getCapabilitiesUrl = url;
    var context = new Jsonix.Context([XLink_1_0, WMS_1_1_1], {
        namespacePrefixes: {
            "http://www.opengis.net/wms": "",
            "http://www.w3.org/1999/xlink": "xlink"
        },
        mappingStyle: "simplified"
    });

    var unmarshaller = context.createUnmarshaller();
    unmarshaller.unmarshalURL(getCapabilitiesUrl, function(result) {
        callback1(result);
    });

}


// Signatur: getGetCapabilitiesURL : JSON, service, callback ->
// Description: Takes an Json-Document with a certain JSON-structure and konstructs the getCapabiltiesURL for a certain value (service) of an id.

function getGetCapabilitiesURL(json, service){
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    var getCapabilitiesUrl = checkedRequest.object.baseURLService + checkedRequest.object.id + checkedRequest.object.getMapCapabilities;
    //callback(getCapabilitiesUrl, callback);
    return getCapabilitiesUrl;
}





module.exports = {
  getKeyValueObject : getKeyValueObject,
  getGetCapabilitiesURL : getGetCapabilitiesURL,
  unmarshallXML : unmarshallXML
}
