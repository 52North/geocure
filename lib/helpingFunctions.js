
  var fs = require("fs");
var requestUtils = require("./request-utils");
// Functions serve to keep track of the Requrst in the Terminal .

function logStart(URL) {
    console.log("++++++++++++++ START -> " + URL + " +++++++++++++++++");
}

function logEnd(URL) {
    console.log("++++++++++++++++ END -> " + URL + " +++++++++++++++++");
}




//############################################################################################################################
// Signatur: verifyObjectId : json objectID -> Object
// Description: Consumes a JSON (json) and a string (objectID) and returns an Object which attributes represent the result.
// result[0] contains a BOOLEAN which indicates whether the id was found in the json.
// result[1] contains the object, with the id or NULL.


function getKeyValueObject(json, key, value) {
    console.log("At function getKeyValueObject()");
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
    console.log("Finishing function getKeyValueObject()");
    return result;
}




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


// Signatur: getGetCapabilitiesURL : JSON, service, callback ->
// Description: Takes an Json-Document with a certain JSON-structure and konstructs the getCapabiltiesURL for a certain value (service) of an id.

function getGetCapabilitiesURL(json, service) {
  console.log("At function getCapabilitiesUrl()");
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    var getCapabilitiesUrl = checkedRequest.object.baseURLService + "wms?request=GetCapabilities&service=wms";
    console.log("Finishing getCapabilitiesUrl()");
    return getCapabilitiesUrl;
}


// Signatur: getBaseURL : JSON, service -> String
// Description: Takes an Json-Document with a certain JSON-structure and returns the baseURL
function getBaseURL(json, service) {
  console.log("At getBaseURL()");
    var checkedRequest = getKeyValueObject(json, "id", service);
    // Construct the URL for the getCapabilites
    // Check checkedRequest! Fehlerbehandlung!
    var getBaseURL = checkedRequest.object.baseURLService;
    console.log("Finishing getBaseURL()");
    return getBaseURL;
}



// Signature
// Description
function getCrsInfoSimple(Layer) {
  console.log("At getCrsInfoSimple()");
    var response = null;
    if ("boundingBox" in Layer) {
        response = [];
        response = Layer.boundingBox;
    }
    console.log("Finishing getCrsInfoSimple()");
    return response;
}



// Signatur: getLayerInfo : Layer, RequestURL -> JSON-Object
// Description: Takes the "Layer-section"- of an WMS-GetCapabilities 1.3.0 -Document and returns crs-information for a given crs.
function getLayerInfo(Layer, RequestURL) {
  console.log("At getLayerInfo()");
    var layersObject = {}; // Object to be filled

    if ("name" in Layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        res.send("name gefunden"); // TO Do:  Implemenetation of something useful!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } else {
        for (var i = 0; i < Layer.layer.length; i++) {
            var key = Layer.layer[i].name;
            layersObject[key] = RequestURL + '/' + key + "/render";
        }
    }
    console.log("Finishing getLayerInfo()");
    return layersObject;
}


// Signatur: getLayerInfo : Layer, RequestURL -> JSON-Object
// Description: Takes the "Layer-section"- of an WMS-GetCapabilities 1.3.0 -Document and returns crs-information for a given crs.
function getAllLayersRequest(Layer) {
  console.log("At getAllLayersRequest()");
    var result = "";
    var keys = [];
    if ("name" in Layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        return ("name gefunden"); // TO Do:  Implemenetation of something useful
    } else {
        for (var i = 0; i < Layer.layer.length; i++) {
            var key = Layer.layer[i].name;
            console.log(key);
            // result = result + JSON.stringify(key);

            result = result + "," + key;
        }
    }
    console.log("Finishing getAllLayersRequest()");
    return result.substring(1, result.length); // substring is jused to temove last ":"
}



// Signature
// Description
function getGlobalBBOX(json) {
  console.log("At getGlobalBBOX()");
    // Needed to access the minx,miny, maxx, maxy for bbox and get CRS-Info
    var layer = json.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
    var refInfo = getCrsInfoSimple(layer);
    var result = null;
    if (refInfo.length > 0) {
        result = refInfo[0].miny + "," + refInfo[0].minx + "," + refInfo[0].maxy + "," + refInfo[0].maxx
    }
    console.log("Finishing getGlobalBBOX()");
    return result
}

//Signatur: getCrs: json -> String
//Description: Takes a json-representation of getCapabilities and returns
// the difined CRS.
function getCrs (getCapabilities) {
  console.log("At getCRS()");
  var layer = getCapabilities.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
  var refInfo = getCrsInfoSimple(layer);
  var result = null;

  if (refInfo[0].crs === "CRS:84") {
      result = "EPSG:4326"
  } else {
      result = refInfo[0].crs
  }
  console.log("Finishing getCrs()");
  return result;
}

//Signatur: checkCrs: String : BOOLEAN
//Description: Checks whether a given CRS is supported by the services
function checkCrs (crs) {
  console.log("At checkCrs()"); // Implementation has to be done! Look into the json-GetCapabilities for the structure and than check for crs.
  return true;
}

// Signature
// Description
function checkServices(services) {
  console.log("At function checkServices()");
    var result = true;
    services.forEach(function(entry) {
        if (!("id" in entry)) {
            console.log("The key 'id' is missing");
            result = false;
        }
        if (!("href" in entry)) {
            console.log("The key 'href' is missing");
            result = false;
        }
        if (!("baseURLService" in entry)) {
            console.log("The key 'baseURLService' is missing");
            result = false;
        }
        if (!("layers" in entry)) {
            console.log("The key 'layers' is missing()");
            result = false;
        }
    })
    console.log("Finishing checkServices");
    return result;
}

function getRequestURL (layer, bbox, crs, width, height, ServiceGetCapabilities, services, id, format) {
  console.log("At function getRequestURL");
  var allLayers = false;

  if (!layer) {
    layer = getAllLayersRequest(ServiceGetCapabilities.WMS_Capabilities.capability.layer);
  }
  if (!bbox) {
    bbox = getGlobalBBOX(ServiceGetCapabilities);
    console.log("bbox is: " + bbox);
  }
  if (!crs) {
    crs = getCrs(ServiceGetCapabilities);
    console.log("crs is: " + crs);
  }
  else {
    checkCrs (crs);
  }
  if (!width) {
    width = services[0].defaultWidth;
  }
  if (!height) {
    console.log("Get default height")
    height = services[0].defaultHeight;
    console.log("Default height is: " + height);
  }

  if (!format) {
    format = services[0].defaultFormat;
    console.log("Default format is: " + format);

  }

  var baseURL = getBaseURL(services, id) + "wms?";
  var service = "service=wms";
  var version = "version=" + ServiceGetCapabilities.WMS_Capabilities.version;
  var request = "request=GetMap";
  var requestURL = baseURL + service + "&" + version + "&" + request + "&" + "layers=" + layer + "&" + "bbox=" + bbox + "&" + "crs=" + crs + "&" + "width=" + width + "&" + "height=" + height + "&" + "format=" + format;
  console.log("Constructed URL in getRequestURL");
  console.log(requestURL);
  return requestURL;
}


module.exports = {
    logStart: logStart,
    logEnd: logEnd,
    getKeyValueObject: getKeyValueObject,
    getGetCapabilitiesURL: getGetCapabilitiesURL,
    unmarshallXML: unmarshallXML,
    getCrsInfoSimple: getCrsInfoSimple,
    getLayerInfo: getLayerInfo,
    getBaseURL: getBaseURL,
    getAllLayersRequest: getAllLayersRequest,
    ggetGlobalBBOX: getGlobalBBOX,
    checkServices: checkServices,
    getRequestURL: getRequestURL

}
