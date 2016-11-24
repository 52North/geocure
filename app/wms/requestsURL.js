const generalURLConstructor = require("../general/url.js");

function getCapabilities(serviceURL){
  let url = generalURLConstructor.getBaseURL(serviceURL, ["wms", "1.3.0"]);
  return url + "&REQUEST=getCapabilities";
}

module.exports = {
  getCapabilities : getCapabilities
}
