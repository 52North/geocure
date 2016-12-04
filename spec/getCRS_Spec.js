const requestsURL = require("../app/wms/requestsURL.js");
const DummyCapabilities = require("./expetedWMSGetCapabilities.js");


describe("getCRS", () => {
  it("returns for no crs-value the default crs. Currently EPSG:4326", done => {
    const response = requestsURL.getCRS(DummyCapabilities.get(),{"arg": 1});
    expect(response).toEqual("EPSG:4326");
    done();
  });

  it("returns the crs if it was valid", done => {

    const response = requestsURL.getCRS({capabilities : DummyCapabilities.get()},{"crs": "EPSG:3068"});
    expect(response).toEqual("EPSG:3068")
    done();
  });
})
