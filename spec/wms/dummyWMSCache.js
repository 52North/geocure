const capabilities = require("./WMSgetCapabilities.json");

function getCache() {
        "use strict";
        return capabilities;
}

module.exports = {
  getCache : getCache
}
