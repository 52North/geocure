const maps = require("../../app/wms/maps.js");
const validWMSgetCapabilities = require("./WMSgetCapabilities.json");
const validServices = require("./validServices.json");
const noMapsEnabled = require("./validServicesOnlyFeaturesEnabled.json");

const req = {fullUrl: "http://localhost:8002/services", params : {id : "local01"}, fullUrl : "http://localhost:8002/services/local01/maps"};

describe("describeMap", () => {
  it("should return the expected output for valid input", done => {
    expect(maps.describeMap(validWMSgetCapabilities, req, validServices)).toEqual(validOutput);
    done();
  });

  it("should return an error-object if the id is not supported", done => {
      expect(maps.describeMap(validWMSgetCapabilities, req, noMapsEnabled)).toEqual(expectedError);
      done();
  });
});


const validOutput = {
  "layers": [
    {
      "id": "map",
      "title": "map",
      "href": "http://localhost:8002/services/local01/maps/render?layer=map"
    },
    {
      "id": "map_neue_zusaetzliche",
      "title": "map neue zusaetzliche",
      "href": "http://localhost:8002/services/local01/maps/render?layer=map_neue_zusaetzliche"
    }
  ],
  "crs": {
    "TYPE_NAME": "WMS_1_3_0.EXGeographicBoundingBox",
    "westBoundLongitude": 29.327170000004116,
    "eastBoundLongitude": 40.44322000001557,
    "southBoundLatitude": -11.745699999999488,
    "northBoundLatitude": -0.9820300000001225,
    "crs": "EPSG:4326"
  }
};

const expectedError = { statuscode : 404, exceptions : [ { code : 'id not found', locator : 'describeMap', text : 'Service with requested id is not supported' } ] }
