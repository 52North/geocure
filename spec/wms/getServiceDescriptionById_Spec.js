const wmsServices = require("../../app/wms/wmsServices.js");
const validServices = require("./validServices.json");
const validServicesOnlyFeaturesEnabled = require("./validServicesOnlyFeaturesEnabled.json");
const validServicesOnlyMapsEnabled = require("./validServicesOnlyMapsEnabled.json");
const validServicesOnlyNothingEnabled = require("./validServicesOnlyNothingEnabled.json");

const req = {fullUrl: "http://localhost:8002/services", params : {id : "local01"}, fullUrl : "http://localhost:8002/services/local01"};


describe("getServiceDescriptionById", () => {
  it("should return the link to maps and features, if both are enabled.", done => {
    expect(wmsServices.getServiceDescriptionById(validServices, req)).toEqual(expectedResponseMapsFeaturesEnables);
    done();
  });

  it("should only return the enabled map.", done => {
    expect(wmsServices.getServiceDescriptionById(validServicesOnlyMapsEnabled, req)).toEqual(expectedResponseMapsEnables);
    done();
  })

  it("should only return the enabled map.", done => {
    expect(wmsServices.getServiceDescriptionById(validServicesOnlyFeaturesEnabled, req)).toEqual(expectedResponseFeaturesEnables);
    done();
  })

  it("nothing enabled", done => {
    expect(wmsServices.getServiceDescriptionById(validServicesOnlyNothingEnabled, req)).toEqual(responseNothingEnabled);
    done();
  })
});




const expectedResponseMapsFeaturesEnables = {
  id : 'local01',
  label : 'Local Testservice',
  description : 'Offers data (points and areas) for development.',
  capabilities : { maps : 'http://localhost:8002/services/local01/map',
  features : 'http://localhost:8002/services/local01/features' }
};

const expectedResponseMapsEnables = {
  id : 'local01',
  label : 'Local Testservice',
  description : 'Offers data (points and areas) for development.',
  capabilities : { maps : 'http://localhost:8002/services/local01/map' }
}

const expectedResponseFeaturesEnables = {
  id : 'local01',
  label : 'Local Testservice',
  description : 'Offers data (points and areas) for development.',
  capabilities : { features : 'http://localhost:8002/services/local01/features' }
};

const responseNothingEnabled ={ statuscode : 404, exceptions : [ { code : 'Not found', locator : 'getServiceDescriptionById', text : 'No service for requested id' }]};
