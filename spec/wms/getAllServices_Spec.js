const wmsServices = require("../../app/wms/wmsServices.js");
const validServices = require("./validServices.json");
const validServices_disabled_map_features = require("./ValidServices_disabled_map&features.json")
const inValidServices = require("./inValidServices.json");

const req = {fullUrl: "http://localhost:8002/services"};


describe("getAllServices", () => {
  it("should return the valid representation for a valid description.", done => {
    expect(wmsServices.getAllServices(validServices, req)).toEqual(expected_validServices);
    done();
  });

  it("should leaf the service out, if maps && features are not enabled.", done => {
    expect(wmsServices.getAllServices(validServices_disabled_map_features, req)).toEqual(expected_validServices_disabled_map_features);
    done();
  });

  it("should return an error-representation for a invalid services.json.", done => {
    expect(wmsServices.getAllServices(inValidServices, req)).toEqual(expectedError);
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

const expectedError =  { statuscode : 500, exceptions : [ { code : 'AttributeError', locator : 'getAllServices', text : 'Not all attributes available' } ] } ;
