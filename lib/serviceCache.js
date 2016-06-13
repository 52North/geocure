
var servicesDescription = require('../services/services.json');
var helpingFunctions = require("./helpingFunctions");
var services = [];

var updateServices = function() {
  for(var i = 0; i < servicesDescription.length; i++){
    var id = servicesDescription[i].id;
    var url = helpingFunctions.getGetCapabilitiesURL(servicesDescription, id);
  }
  services =  [
    {
      name: "service1"
    }
  ]
}

var getServices = function() {
  return services;
}

module.exports = {
  getServices : getServices,
  updateServices : updateServices
}
