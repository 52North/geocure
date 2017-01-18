const wmsServices = require("../../app/wms/wmsServices.js");
const validServices = require("./validServices.json");
const validServices_disabled_map_features = require("./ValidServices_disabled_map&features.json")

const req = {fullUrl: "http://localhost:8002/services"};


describe("getAllServices", () => {
  it("should return the valid representation for a valid description.", done => {
    expect(wmsServices.getAllServices(validServices, req)).toEqual(expected_validServices);
    done();
  });

  it("should leaf an service out, if maps && features are not enabled.", done => {
    expect(wmsServices.getAllServices(validServices_disabled_map_features, req)).toEqual(expected_validServices_disabled_map_features);
    done();
  });

});




const expected_validServices = [
  {
    "id": "local01",
    "label": "Local Testservice",
    "description": "Offers data (points and areas) for development.",
    "href": "http://localhost:8002/services/local01"
  },
  {
    "id": "local10",
    "label": "Local Testservice disabled wfs",
    "description": "Offers data (points and areas) for development.",
    "href": "http://localhost:8002/services/local10"
  }
];

const expected_validServices_disabled_map_features = [
  {
    "id": "local01",
    "label": "Local Testservice",
    "description": "Offers data (points and areas) for development.",
    "href": "http://localhost:8002/services/local01"
  }
];
