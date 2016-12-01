const DummyCapabilities = require("./expetedWMSGetCapabilities.js");
const requestURL = require("../app/wms/requestsURL.js");

describe("layerValid", () => {
  it("returns true for a valid request", done => {

    const response = requestURL.layerValid({"capabilities": DummyCapabilities.get()}, {"layers" : "areas,points"});
    expect(response).toBe(true);
    done();
  });

  it("throws an error for an invalid layerrequest", done => {
    // const response = requestURL.layerValid({"capabilities": DummyCapabilities.get()}, {"layers" : "invalid1,points"});
    expect(() => requestURL.layerValid({"capabilities": DummyCapabilities.get()}, {"layers" : "invalid1,points"})).toThrow();
    done();
  });
})
