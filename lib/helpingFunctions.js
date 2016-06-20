var fs = require('fs');
var requestUtils = require('./request-utils');
//############################################################################################################################
// Signatur: verifyObjectId : json objectID -> Object
// Description: Consumes a JSON (json) and a string (objectID) and returns an Object which attributes represent the result.
// result[0] contains a BOOLEAN which indicates whether the id was found in the json.
// result[1] contains the object, with the id or NULL.


function getKeyValueObject(json, key, value) {

    var result = {
        keyFound: false,
        object: null
    };

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
var WMS_1_3_0 = require('ogc-schemas').WMS_1_3_0;
// ENDE Denpendencies for XML-Parsion

function unmarshallXML(url, callback) {
    console.log("We are at unmarschallXML");
    var getCapabilitiesUrl = url;
    console.log("capabilitiesURL:");
    console.log(getCapabilitiesUrl);
    console.log("context is next");
    var context = new Jsonix.Context([XLink_1_0, WMS_1_3_0], {
        namespacePrefixes: {
            "http://www.opengis.net/wms": "",
            "http://www.w3.org/1999/xlink": "xlink"
        },
        mappingStyle: "simplified"
    });

    console.log("pos 1");
    var unmarshaller = context.createUnmarshaller();
    unmarshaller.unmarshalURL(getCapabilitiesUrl, function(result) {
        //return result;
        callback(result);
        // fs.writeFile(("id" +  ,JSON.stringify(result), function(err){
        //   if(err){
        //     return console.log(err);
        //   }
        //   console.log("File saved");
        //})
    });
    console.log("I am here at the end");
}


// Signatur: getGetCapabilitiesURL : JSON, service, callback ->
// Description: Takes an Json-Document with a certain JSON-structure and konstructs the getCapabiltiesURL for a certain value (service) of an id.

function getGetCapabilitiesURL(json, service) {
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    var getCapabilitiesUrl = checkedRequest.object.baseURLService + checkedRequest.object.getMapCapabilities;
    return getCapabilitiesUrl;
}


// Signatur: getBaseURL : JSON, service -> String
// Description: Takes an Json-Document with a certain JSON-structure and returns the baseURL
function getBaseURL(json, service) {
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    // Check checkedRequest! Fehlerbehandlung!
    var getBaseURL = checkedRequest.object.baseURLService;
    return getBaseURL;
}


// Signatur: getCrsInfo : Layer, crsName -> JSON-Object
// Description: Takes the "Layer-section"- of an WMS-GetCapabilities 1.3.0 -Document and returns crs-information for a given crs.

function getCrsInfo(Layer, crsName) {
    var crsInfo = {}; // Object to be filled

    if ("boundingBox" in Layer) {
        for (var i = 0; i < Layer.boundingBox.length; i++) {
            console.log(Layer.boundingBox[i].crs);
            if (Layer.boundingBox[i].crs == crsName) {
                crsInfo["name"] = Layer.boundingBox[i].crs;
                crsInfo["bbox"] = {
                    "minx": Layer.boundingBox[i].minx,
                    "miny": Layer.boundingBox[i].miny,
                    "maxx": Layer.boundingBox[i].maxx,
                    "maxy": Layer.boundingBox[i].maxy,
                }
                i = Layer.boundingBox.length; // If found, exit loop
            }
        }
    }
    return crsInfo;
}


// Alternative to above
function getCrsInfoSimple(Layer) {
    var response = [];
    if ("boundingBox" in Layer) {
        response = Layer.boundingBox;
    }
    return response;
}



// Signatur: getLayerInfo : Layer, RequestURL -> JSON-Object
// Description: Takes the "Layer-section"- of an WMS-GetCapabilities 1.3.0 -Document and returns crs-information for a given crs.
function getLayerInfo(Layer, RequestURL) {
    var layersObject = {}; // Object to be filled

    if ("name" in Layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        res.send("name gefunden"); // TO Do:  Implemenetation of something useful
    } else {
        for (var i = 0; i < Layer.layer.length; i++) {
            var key = Layer.layer[i].name;
            layersObject[key] = RequestURL + '/' + key;;
        }
    }
    return layersObject;
}


// Signatur: getLayerInfo : Layer, RequestURL -> JSON-Object
// Description: Takes the "Layer-section"- of an WMS-GetCapabilities 1.3.0 -Document and returns crs-information for a given crs.
function getAllLayersRequest(Layer) {
    var result = "";
    var keys = [];
    if ("name" in Layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        return("name gefunden"); // TO Do:  Implemenetation of something useful
    } else {
        for(var i = 0; i < Layer.layer.length; i++) {
            var key = Layer.layer[i].name;
            // console.log(key);
            // result = result + JSON.stringify(key);
            result = result + key + ":";
        }
    }
    return result.substring(0, result.length-1); // substring is jused to temove last ":"
}



module.exports = {
    getKeyValueObject: getKeyValueObject,
    getGetCapabilitiesURL: getGetCapabilitiesURL,
    unmarshallXML: unmarshallXML,
    getCrsInfo: getCrsInfo,
    getCrsInfoSimple: getCrsInfoSimple,
    getLayerInfo: getLayerInfo,
    getBaseURL: getBaseURL,
    getAllLayersRequest: getAllLayersRequest
}
