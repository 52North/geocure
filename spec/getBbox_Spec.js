const requestsURL = require("../app/wms/requestsURL.js");
const DummyCapabilities = require("./expetedWMSGetCapabilities.js");
describe("getBbox", () => {
  it("returns the default max bbox if no bbox is given", done => {
    expect(requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {nothing: 1})).toEqual("6.8747774686921925,51.54972640706632,6.895382390517432,51.564444208370055");
    done();
  });

  it("returns the default max bbox if no bbox is given - counter check", done => {
    expect(requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {nothing: 1})).not.toEqual("6.874686921925,51.54972640706632,6.895382390517432,51.564444208370055");
    done();
  });

  it("accecpts the max bbox", done => {
    expect(requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706632,6.895382390517432,51.564444208370055"})).toEqual("6.8747774686921925,51.54972640706632,6.895382390517432,51.564444208370055");
    done();
  });

  it("throws an error if not all parameter are given", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706632,6.89538239517432,51.564444208370055"})).toThrow("requestResponses bbox");
    done();
  });

  it("throws an error if not the input was not valid - ?", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706632,6.8953823951743?2,51.564444208370055"})).toThrow("requestResponses bbox");
    done();
  });

  it("throws an error if not the input was not valid - lnf", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706632,lnf6.8953823951743?2,51.564444208370055"})).toThrow("requestResponses bbox");
    done();
  });

  it("throws an error if given min x is smaller than max minx", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921924,51.54972640706632,6.895382390517432,51.564444208370055"})).toThrow("requestResponses bbox");
    done();
  });
  it("throws an error if given min y is smaller than max miny", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706630,6.895382390517432,51.564444208370055"})).toThrow("requestResponses bbox");
    done();
  });
  it("throws an error if given max x is greater than max maxx", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706632,6.895382390517433,51.564444208370055"})).toThrow("requestResponses bbox");
    done();
  });
  it("throws an error if given max y is greater than max maxy", done => {
    expect(() => requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.8747774686921925,51.54972640706632,6.895382390517432,51.564444208370059"})).toThrow("requestResponses bbox");
    done();
  });

  it("returns a valid bbox in the requested crs", done => {
    expect(requestsURL.getBbox({capabilities: DummyCapabilities.get()}, {bbox: "6.876029965823197,51.550512553243976,6.896634783083931,51.565229678558396", crs: "EPSG:4839"})).toEqual("6.876029965823197,51.550512553243976,6.896634783083931,51.565229678558396");
    done();
  });
})
