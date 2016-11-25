const generalURLConstructor = require("../general/url.js");
const version = "1.3.0";

function getCapabilities(serviceURL){
  let url = generalURLConstructor.getBaseURL(serviceURL, ["wms", version]);
  return url + "&REQUEST=getCapabilities";
}

module.exports = {
  getCapabilities : getCapabilities
}
