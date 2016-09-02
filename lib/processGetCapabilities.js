/**
This library is intended to process getCapabilities, which are passed as JSON-format.
**/

// Internal libraries
var processJSON = require("./processJSON");

// External libraries
var error = require("restify-error");


/**
Signature: getServiceInfo : Array, Array, Object-> Object

Description: Creates a map-Info Object whith the properties "layers" and "crs".

**/

function getServicesInfo(services, serviceCache, req) {
  console.log("At getServicesInfo()");


  var output = [];

  // Object type for the overview of a single service
  function ServiceOverview(id, label, description, href) {
      this.id = id;
      this.label = label;
      this.description = description;
      var RequestURL = req.fullUrl;
      this.href = RequestURL + "/" + this.id;
  }

  // By constructing the output. Way to avoid redudant information about services in different files.

  services.forEach(function(serviceElement) {
      var aService = new ServiceOverview(serviceElement.id, serviceElement.label, serviceElement.description, serviceElement.href);
      output.push(aService);
  })

  return output;
}



/**
Signature: getServiceInfo : Array, Array, Object-> Object

Description: Creates a map-Info Object whith the properties "layers" and "crs".

**/

function getServiceInfo(services, serviceCache, req) {
  console.log("At getServiceInfo()");
  // Template for result
  var response = {
      id: "" ,
      label: "",
      description: "",
      capabilities: []
  }


  // ERROR-HANDLING
  // services checked after starting the server for required keys, so "id" exists. Here check for the value of the key.

  var checkedRequest = processJSON.getKeyValueObject(services, "id", req.params.id);
  console.log("Does the requested id " + req.params.id + " exists?");
  if (!checkedRequest) {
      return new error.BadRequestError("No service with id " + req.params.id);

  }
  console.log("Yes, the requested id exists");
  response.id = checkedRequest.id;
  response.label = checkedRequest.label;
  response.description = checkedRequest.description;

  if (checkedRequest.capabilities[0].maps) {
    response.capabilities.push(req.fullUrl + "/maps");
  }
  if (checkedRequest.capabilities[0].features) {
    response.capabilities.push(req.fullUrl + "/features");
  }


  console.log("Finisching getServiceInfo()");
  return response;
}

/**
Signature: getMapInfo : Array, Array, Object-> Object

Description: Creates a map-Info Object whith the properties "layers" and "crs".

**/

function getMapInfo(services, serviceCache, req) {
  console.log("At getMapInfo()");
    console.log("Does the requested id " + req.params.id + " exists?");
    if (!processJSON.getKeyValueObject(services, "id", req.params.id)) {
        return (new error.BadRequestError("No service with id " + req.params.id));
    }
    console.log("Yes, the requested id exists");


    // ERROR-HANDLING: services tested after serverstart, req.params.id checked at the beginning of this endpoint
    var url = processJSON.getGetCapabilitiesURL(services, req.params.id);
    //console.log(serviceCache);
    var json = serviceCache.getServices()[req.params.id]; // Get JSON-GetCapabilities to requestet
    //console.log(json);
    // ERROR-HANDLING
    console.log("Does the json-file for the requested service exist?");
    if (!json) {
        return new error.InternalServerError("required json-file is not available. Please wait and reload again.");
    }
    console.log("Yes, the json-file for the requested service exists");


    // Template for the output
    function mapInfoTemplate() {
        this.layers = [];
        this.crs = [];
        this.addLayer = function(layerObject) {
            this.layers.push(layerObject);
        }
        this.addCrs = function(crsInfo) {
            this.crs = crsInfo;
        }
    }

    var mapinfo = new mapInfoTemplate(); // Need it to fill it in the following lines with information
    var layer = json.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
    console.log("Layerlength = " + layer.length);
    //console.log(layer);

    // ERROR-HANDLING
    console.log("Does json.WMS_Capabilities.capability.layer exists?");
    if (!layer) {
        return new error.InternalServerError("Information about layer is not available");
    }
    console.log("Yes, json.WMS_Capabilities.capability.layer exists");



    // START creating info about CRS
    crs = getCRS(json);
    mapinfo.addCrs(crs);
    // END creating info about crs

    // START creating info about layers
    mapinfo.addLayer(getLayerInfo(json, req.fullUrl)); // To be updated zto COLABIS Layer
    // END creating info about layers

    console.log("Finishing getMapInfo()");
    return mapinfo;
}

/**
Signature: getFeatureInfo : Array, Array, Object-> Object

Description: Creates a feature-Info Object whith the properties "features" and "crs".

**/

function getFeatureInfo (services, WFSCache, req) {
  console.log("At getFeatureInfo()");
    console.log("Does the requested id " + req.params.id + " exists?");
    if (!processJSON.getKeyValueObject(services, "id", req.params.id)) {
        return (new error.BadRequestError("No service with id " + req.params.id));
    }
    console.log("Yes, the requested id exists");


    // ERROR-HANDLING: services tested after serverstart, req.params.id checked at the beginning of this endpoint
    var url = processJSON.getGetCapabilitiesURLWFS(services, req.params.id);
    console.log("getFeatureInfo() url = "  +  url);
    //console.log(serviceCache);
    var json = WFSCache.getServices()[req.params.id]; // Get JSON-GetCapabilities to requestet
    //console.log(json);
    // ERROR-HANDLING
    console.log("Does the json-file for the requested service exist?");
    if (!json) {
        return new error.InternalServerError("required json-file is not available. Please wait and reload again.");
    }
    console.log("Yes, the json-file for the requested service exists");


    // Template for the output
    function mapInfoTemplate() {
        this.layers = [];
        this.crs = [];
        this.addLayer = function(layerObject) {
            this.layers.push(layerObject);
        }
        this.addCrs = function(crsInfo) {
            this.crs = crsInfo;
        }
    }

    var mapinfo = new mapInfoTemplate(); // Need it to fill it in the following lines with information
    var features = getAllFeaturesInfo(json); // Accessing the layer-section of the GetCapabilitie-Json
    console.log(json["wfs:WFS_Capabilities"]["featureTypeList"]);
    // console.log("Layerlength = " + layer.length);
    // //console.log(layer);
    //
    // // ERROR-HANDLING
    // console.log("Does json.WMS_Capabilities.capability.layer exists?");
    // if (!layer) {
    //     return new error.InternalServerError("Information about layer is not available");
    // }
    // console.log("Yes, json.WMS_Capabilities.capability.layer exists");
    //
    //
    //
    // // START creating info about CRS
    // crs = getCRS(json);
    // mapinfo.addCrs(crs);
    // // END creating info about crs
    //
    // // START creating info about layers
    // mapinfo.addLayer(getLayerInfo(json, req.fullUrl)); // To be updated zto COLABIS Layer
    // // END creating info about layers
    //
    // console.log("Finishing getFeatureInfo()");
    // return mapinfo;
}

/**
Signature: getAllFeaturesInfo : Object -> Object

Description: Creates the elements for the features for the endpoint :id/features

**/
function getAllFeaturesInfo(getCapabilities) {
  const featureNames = getAllFeatures(getCapabilities);
}


/**
Signature: getAllFeatures : Object -> Object

Description: Returns an Object, which properynames are the offered features.

**/
function getAllFeatures(getCapabilities) {
  if(!("wfs:WFS_Capabilities" in getCapabilities)) {
    return new error.InternalServerError("GetCapabilities for the WFS does not contain the property wfs:WFS_Capabilities");
  }
  const 

  getCapabilities["wfs:WFS_Capabilities"]["featureTypeList"]

}

/**
Signature: getCRS : JSON-Object -> JSON-Object

Description: Takes getCapabilities and returns the information about the CRS and the bbox.
**/
function getCRS(getCapabilities) {
    console.log("At getCRS()");

    // Do the capabilities contain the used properties?
    if (!getCapabilities) {
        return new error.InternalServerError("The getCapabilities are not accessible");
    }
    if (!getCapabilities.WMS_Capabilities) {
        return new error.InternalServerError("The key 'WMS_Capabilities' is not accessible in getCapabilities");

    }
    if (!getCapabilities.WMS_Capabilities.capability) {
        return new error.InternalServerError("The key 'capability' is not accessible in getCapabilities.WMS_Capabilities");
    }
    if (!getCapabilities.WMS_Capabilities.capability.layer) {
        return new error.InternalServerError("The key 'layer' is not accessible in getCapabilities.WMS_Capabilities.capability");
    }
    if (!getCapabilities.WMS_Capabilities.capability.layer.boundingBox) {
        return new error.InternalServerError("The key 'boundingBox' is not accessible in getCapabilities.WMS_Capabilities.capability.layer");
    }

    //console.log(Layer);
    var response = getCapabilities.WMS_Capabilities.capability.layer.boundingBox;
    if (response[0].crs === "CRS:84") {
        response[0].crs = "EPSG:4326";
    }

    console.log("Finishing getCRS()");
    return response;
}



/**
Signature: getLayerInfo : JSON-Object, String -> Array

Description: Takes getCapabilities (JSON-Object) and the current request-url (String) and returns an array, which holds an object.
The key-value pair has following structure: name of the layer : URL to the endpoint which renders the layer in the max. bbox of the service
**/

function getLayerInfo(getCapabilities, requestURL) {
    console.log("At getLayerInfo()");
    var layersObject = {}; // Object to be filled
    if (!getCapabilities) {
        return new error.InternalServerError("The getCapabilities are not accessible");
    }
    if (!getCapabilities.WMS_Capabilities) {
        return new error.InternalServerError("The key 'WMS_Capabilities' is not accessible in getCapabilities");

    }
    if (!getCapabilities.WMS_Capabilities.capability) {
        return new error.InternalServerError("The key 'capability' is not accessible in getCapabilities.WMS_Capabilities");
    }
    if (!getCapabilities.WMS_Capabilities.capability.layer) {
        return new error.InternalServerError("The key 'layer' is not accessible in getCapabilities.WMS_Capabilities");
    }

    var layer = getCapabilities.WMS_Capabilities.capability.layer;
    if ("name" in layer) { // if TRUE => Onle this layer exists and no further layer in a folowing array.
        res.send("name gefunden"); // TO Do:  Implemenetation of something useful!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } else {
        for (var i = 0; i < layer.layer.length; i++) {
            var key = layer.layer[i].name;
            layersObject[key] = requestURL + '/' + key + "/render";
        }
    }
    console.log("Finishing getLayerInfo()");
    return layersObject;
}



/**
Signature: getAllLayersAsString : JSON-Object -> String

Description: Takes getCapabilities and returns all names of offered layers as a string.
**/
function getAllLayersAsString(getCapabilities) {
    console.log("At getAllLayersAsString()");
    var layerObject = getLayerInfo(getCapabilities, ""); // Setting URL to empty string because we do not need it here
    if (layerObject.code) { // restify-error is an object with the properties 'code' and 'message'. Here we check for the property 'code'. If this property exists, we assume an error and pass the message
        return layerObject;
    }
    var keys = Object.keys(layerObject);
    console.log("Finishing getAllLayersAsString()");
    return keys.toString();
}



/**
Signature: getAllLayersAsString : JSON-Object -> String

Description: Takes getCapabilities and returns all names of offered layers as a string.
**/
function getGlobalBboxAsString(getCapabilities) {
    console.log("At getGlobalBBOXAsString()");
    // Needed to access the minx,miny, maxx, maxy for bbox and get CRS-Info
    var refInfo = getCRS(getCapabilities);
    if (refInfo.code) { // Did an error occurred in getCRS?
      return refInfo;
    }

    var result = null;
    if (refInfo.length > 0) {
        result = refInfo[0].miny + "," + refInfo[0].minx + "," + refInfo[0].maxy + "," + refInfo[0].maxx
    }
    else {
      result = new error.InternalServerError("No information about a bbox.");
    }
    console.log("Finishing getGlobalBBOXAsString()");
    return result
}




module.exports = {
  getServicesInfo: getServicesInfo,
    getMapInfo: getMapInfo,
    getCRS: getCRS,
    getLayerInfo: getLayerInfo,
    getAllLayersAsString: getAllLayersAsString,
    getGlobalBboxAsString: getGlobalBboxAsString,
    getServiceInfo: getServiceInfo,
    getFeatureInfo: getFeatureInfo
}