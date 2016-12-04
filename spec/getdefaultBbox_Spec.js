const requestURL = require("../app/wms/requestsURL.js");
const DummyCapabilities = require("./expetedWMSGetCapabilities.js");

describe("getdefaultBbox", () => {
  it("should return the maxextent in EPSG:4326, if no crs is given", done => {
    expect(requestURL.getdefaultBbox({capabilities : DummyCapabilities.get()}, {})).toEqual("6.8747774686921925,51.54972640706632,6.895382390517432,51.564444208370055");
    done();
  });

  it("should return the maxextent in EPSG:4326, if no crs is given - counter check", done => {
    expect(requestURL.getdefaultBbox({capabilities : DummyCapabilities.get()}, {})).not.toEqual("6.8747774,51.54972640706632,6.895382390517432,51.564444208370055");
    done();
  });

  it("should throw an error, if a not supported crs is requested.", done => {
    expect(() => requestURL.getdefaultBbox({capabilities : DummyCapabilities.get()}, {crs: 123})).toThrow();
    done();
  });

  it("should return transformed crs values for a valid crs request.", done => {
    expect(requestURL.getdefaultBbox({capabilities : DummyCapabilities.get()}, {crs: "EPSG:4839"})).toEqual("6.876029965823197,51.550512553243976,6.896634783083931,51.565229678558396");
    done();
  });

  it("should return transformed crs values for a valid crs request - counter check.", done => {
    expect(requestURL.getdefaultBbox({capabilities : DummyCapabilities.get()}, {crs: "EPSG:4839"})).not.toEqual("6.876029965823197,51.550512553243976,6.896634931,51.565229678558396");
    done();
  });

})
