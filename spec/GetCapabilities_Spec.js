const getCapabilities = require("../app/general/getCapabilities.js");
const WMSexpected = require("./expetedWMSGetCapabilities.js");
const errorHandling = require("../app/general/errorhandling.js");

describe("app/general/errorhandling.getError", function() {


    it("maps from app/services/statuscodeMapping.json without additional message", function(done) {


      const url = "http://localhost:8080/geoserver/geocure/wms?service=WMS&version=1.3.0&request=GetCapabilities";
      getCapabilities.getJSON_WMS(url).then(cap => {expect(cap).toEqual(WMSexpected.get()); done()})
                                  .catch(error => {consoel.log(error)});
                                  // .catch(() => {expect(()=> {const err = errorHandling.getError("services", "serviceNotAvailable", url);
                                  //                             console.log(err);
                                  //                             throw(err)}).not.toThrow(); done()});
    });
});
