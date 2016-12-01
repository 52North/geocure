const maps = require("../app/wms/maps.js");
const dummyGetCapabilitirs = require("./expetedWMSGetCapabilities.js");

describe("getAllLayers", () => {
  it("returns the expected Collection for the dummyGetCapabilitirs", done => {
    const response = maps.getAllLayers({"capabilities": dummyGetCapabilitirs.get()}, {"fullUrl" : "DummyFullURL"});
    const expected = [{"id":"areas","title":"areas","href":"DummyFullURL/render"},{"id":"points","title":"points","href":"DummyFullURL/render"}];
    expect(response).toEqual(expected);
    done();
  });
})
