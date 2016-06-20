var helpingFunctions = require("./helpingFunctions");

var servicesDescription = require('../services/services.json');
var services = {};

function getURL(serviceDescription, id){
  // Return a new promise.
  return new Promise(function(resilve, reject){
    var url = NULL;
    var url = helpingFunctions.getGetCapabilitiesURL(serviceDescription, id);

    if(url != NULL){
      return(url);
    }
    else{
      reject(Error("url is NULL"));
    }
  });
}


function unmarshallXML(url) {
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
        return(result);
    });

}

var updateServices = function() {
  var serviceURLs = []
  for(var i = 0; i < servicesDescription.length; i++){
    var id = servicesDescription[i].id;
    var url = helpingFunctions.getGetCapabilitiesURL(servicesDescription, id);
    serviceURLs.push({id : id, url : url});
    console.log(JSON.stringify(serviceURLs));

  }

  var requestCapabilities = function(url){
    helpingFunctions.unmarshallXML(url.url, function(json){
      services[url.id] = json;
      console.log(JSON.stringify(services));
      var next = serviceURLs.pop();
      if(next){
        requestCapabilities(next);
      }
    })
  }
  requestCapabilities(serviceURLs.pop());


  getURL(servicesDescription, "COLABIS_REST_TEST").then(function(response){
    console.log("in getUTL");
    return("kldfna");
  })

  // services =  [
  //   {
  //     name: "service1"
  //   }
  // ]
}

var getServices = function() {
  return services;
}

module.exports = {
  getServices : getServices,
  updateServices : updateServices
}
