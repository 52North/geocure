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


    // By constructing the output. Way to avoid redudant information about services in different files.

    services.forEach(function(serviceElement) {

        (function() {
            var serviceOverview = {
                id: "",
                label: "",
                description: "",
                href: ""
            }
            serviceOverview.id = serviceElement.id || "";
            serviceOverview.label = serviceElement.label || "";
            serviceOverview.description = serviceElement.description || "";
            serviceOverview.href = req.fullUrl + "/" + serviceOverview.id || "";
            output.push(serviceOverview);
        }());

    });

    return output;
}



/**
Signature: getServiceInfo : Array, Array, Object-> Object

Description: Creates a map-Info Object whith the properties "layers" and "crs".

**/

function getServiceInfo(services, serviceCache, req) {

    // ERROR-HANDLING
    // services checked after starting the server for required keys, so "id" exists. Here check for the value of the key.

    var checkedRequest = processJSON.getKeyValueObject(services, "id", req.params.id);

    console.log("Finisching getServiceInfo()");
    return !checkedRequest ?  (new error.BadRequestError("No service with id " + req.params.id)) : constructServiceInfo(checkedRequest, req);
}


/**
Signature: constructServiceInfo : JSON-> Object

Description: Creates a map-Info Object whith the properties "layers" and "crs".

**/
function constructServiceInfo(getCapabilities, req) {
  console.log("At constructServiceInfo()");
  // Template for result
  var response = {
      id: "",
      label: "",
      description: "",
      capabilities: []
  }

  response.id = getCapabilities.id;
  response.label = getCapabilities.label;
  response.description = getCapabilities.description;

  response.capabilities.push(getCapabilities.capabilities[0].maps ? req.fullUrl + "/maps" : "");
  response.capabilities.push(getCapabilities.capabilities[0].features ? req.fullUrl + "/features" : "");

  console.log("Finishing constructServiceInfo()");
  return response;
}



/**
Signature: getMapInfo : Array, Array, Object-> Object

Description: Checks the requirements for the getMapInfo and deligates the construction to constructMapInfo.

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
    console.log("Requesting id: " + req.params.id);
    console.log("LOG SERVICES " + serviceCache.getServices());
    var getCapabilities = serviceCache.getServices()[req.params.id]; // Get JSON-GetCapabilities to requestet
    console.log(getCapabilities);
    // ERROR-HANDLING
    console.log("Does the json-file for the requested service exist?");
    if (!getCapabilities) {
        return new error.InternalServerError("required json-file is not available. Please wait and reload again.");
    }
    console.log("Yes, the json-file for the requested service exists");

    console.log("Finisching getMapInfo()");
    return !getCapabilities ? (new error.InternalServerError("required json-file is not available. Please wait and reload again.")) : constructMapInfo(getCapabilities, req);
}


/**
Signature: constructMapInfo : Object, Object -> Object

Description: Creates a map-Info Object whith the properties "layers" and "crs".

**/
function constructMapInfo(getCapabilities, req) {
console.log("At constructMapInfo()");
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

  var mapinfo = new mapInfoTemplate();
  var layer = getCapabilities.WMS_Capabilities.capability.layer; // Accessing the layer-section of the GetCapabilitie-Json
  console.log("Layerlength = " + getCapabilities.length);
  //console.log(layer);

  // ERROR-HANDLING
  console.log("Does json.WMS_Capabilities.capability.layer exists?");
  if (!layer) {
      return new error.InternalServerError("Information about layer is not available");
  }
  console.log("Yes, json.WMS_Capabilities.capability.layer exists");



  // START creating info about CRS
  crs = getCRS(getCapabilities);
  mapinfo.addCrs(crs);
  // END creating info about crs

  // START creating info about layers
  mapinfo.addLayer(getLayerInfo(getCapabilities, req.fullUrl)); // To be updated zto COLABIS Layer
  // END creating info about layers

  console.log("Finishing constructMapInfo()");
  return mapinfo;

}

/**
Signature: getFeatureInfo : Array, Array, Object-> Object

Description: Creates a feature-Info Object whith the properties "features" and "crs".

**/

function getFeatureInfo(services, WFSCache, req) {
    console.log("At getFeatureInfo()");
    console.log("Does the requested id " + req.params.id + " exists?");
    if (!processJSON.getKeyValueObject(services, "id", req.params.id)) {
        return (new error.BadRequestError("No service with id " + req.params.id));
    }
    console.log("Yes, the requested id exists");


    // ERROR-HANDLING: services tested after serverstart, req.params.id checked at the beginning of this endpoint
    var url = processJSON.getGetCapabilitiesURLWFS(services, req.params.id);
    console.log("getFeatureInfo() url = " + url);
    //console.log(serviceCache);
    var getCapabilities = WFSCache.getServices()[req.params.id]; // Get JSON-GetCapabilities to requestet
    //console.log(json);
    // ERROR-HANDLING
    console.log("Does the json-file with the getCapabilities for the requested service exist?");
    if (!getCapabilities) {
        return new error.InternalServerError("required json-file is not available. Please wait and reload again.");
    }
    console.log("Yes, the json-file with the getCapabilities for the requested service exists");


    return  getAllFeaturesInfo(getCapabilities, WFSCache, req); // Accessing the layer-section of the GetCapabilitie-Json

}

/**
Signature: getAllFeaturesInfo : Object -> Object

Description: Creates the elements for the features for the endpoint :id/features

**/
function getAllFeaturesInfo(getCapabilities, WFSCache, req) {
    const featureTypeList = getAllFeatures(WFSCache.getServices()[req.params.id]);

    if (featureTypeList.body) {
      // If getAllFeatures returned an error, pass it to the top.
      return featureTypeList;
    }


    var features = [];
    console.log("featureTypeList" + featureTypeList);
    for (var i = 0; i < featureTypeList.length; i++) {
        features.push({
            title: featureTypeList[i].title,
            minx: featureTypeList[i].wgs84BoundingBox[0].lowerCorner[0],
            miny: featureTypeList[i].wgs84BoundingBox[0].lowerCorner[1],
            maxx: featureTypeList[i].wgs84BoundingBox[0].upperCorner[0],
            maxy: featureTypeList[i].wgs84BoundingBox[0].upperCorner[1]
        });
    }

    console.log("features: " + features);

    var fo = {};
    for (var i = 0; i < features.length; i++) {
        var property = features[i].title;
        var value = req.fullUrl + '/' + features[i].title + "/render";
        fo[property] = value;
    }


    var globWGS84BBOX = {
        TYPE_NAME: "wgs84BoundingBox",
        crs: "EPSG:4326",
        minx: null,
        miny: null,
        maxx: null,
        maxy: null
    }

    for (var i = 0; i < features.length; i++) {
      globWGS84BBOX.minx = !globWGS84BBOX.minx || globWGS84BBOX.minx < features[i].minx ? features[i].minx : globWGS84BBOX.minx;
      globWGS84BBOX.miny = !globWGS84BBOX.miny || globWGS84BBOX.miny < features[i].miny ? features[i].miny : globWGS84BBOX.miny;
      globWGS84BBOX.maxx = !globWGS84BBOX.maxx || globWGS84BBOX.maxx < features[i].maxx ? features[i].maxx : globWGS84BBOX.maxx;
      globWGS84BBOX.maxy = !globWGS84BBOX.maxy || globWGS84BBOX.maxy < features[i].maxy ? features[i].maxy : globWGS84BBOX.maxy;
    }

      var result = {}
      result["features"] = [fo];
      result["crs"] = [globWGS84BBOX];

      return result;

}


/**
Signature: getAllFeatures : Object -> Array

Description: Returns the FeatureTypeList of the GetCapabilities.

**/
function getAllFeatures(getCapabilities) {
    if (!("wfs:WFS_Capabilities" in getCapabilities)) {
        return new error.InternalServerError("GetCapabilities for the WFS does not contain the property wfs:WFS_Capabilities");
    }

    var wfs_GetCapabilities = getCapabilities["wfs:WFS_Capabilities"];
    if (!("featureTypeList" in wfs_GetCapabilities)) {
      console.log(new error.InternalServerError("GetCapabilities for the WFS does not contain the property featureTypeList"));
        return new error.InternalServerError("GetCapabilities for the WFS does not contain the property featureTypeList");
    }

    var featureTypeList = wfs_GetCapabilities["featureTypeList"];

    if (!("featureType" in featureTypeList)) {
        return new error.InternalServerError("GetCapabilities for the WFS does not contain the property featureType");
    }

    return featureTypeList["featureType"];
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
    console.log("Finishing getAllLayersAsString()");
    return layerObject.code ? layerObject : Object.keys(layerObject).toString();
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

    return refInfo.length > 0 ? (refInfo[0].miny + "," + refInfo[0].minx + "," + refInfo[0].maxy + "," + refInfo[0].maxx) : (new error.InternalServerError("No information about a bbox."));

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
    getFeatureInfo: getFeatureInfo,
    getAllFeatures: getAllFeatures
}
