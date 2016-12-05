const requestsURL = require("../app/wms/requestsURL.js");
const DummyCapabilities = require("./expetedWMSGetCapabilities.js");


describe("getFormat", () => {
  it("returns the default format if no argument is given", done => {
    expect(requestsURL.getFormat(validConfig, {capabilities: DummyCapabilities.get()}, {a: 1})).toEqual("image/jpeg")
    done();
  });
  it("throws an error if the default value is not valid", done => {
    expect(() => requestsURL.getFormat(falseConfig, {capabilities: DummyCapabilities.get()}, {a: 1})).toThrow("services format")
    done();
  });
  it("returns a valid requested format", done => {
    expect(requestsURL.getFormat(validConfig, {capabilities: DummyCapabilities.get()}, {format: "application/vnd.google-earth.kml+xml"})).toEqual("application/vnd.google-earth.kml+xml")
    done();
  });
  it("throws an error if a not valid format is requested.", done => {
    expect(() => requestsURL.getFormat(validConfig, {capabilities: DummyCapabilities.get()}, {format: "application/vnd.google-earthkml+xml"})).toThrow("services format")
    done();
  });
})


const validConfig = {
  "id": "string",
  "label": "string",
  "description": "string",
  "url": "string",
  "capabilities": {
    "maps": {
      "enabled": "boolean",
      "defaultvalues": {
        "height": 500,
        "height": 500,
        "format": "image/jpeg"
      }
    },
    "features": {
      "enabled": "boolean",
      "defaultvalues": {
        "format": "string"
      }
    }
  }
}

const falseConfig = {
  "id": "string",
  "label": "string",
  "description": "string",
  "url": "string",
  "capabilities": {
    "maps": {
      "enabled": "boolean",
      "defaultvalues": {
        "height": 500,
        "height": 500,
        "format": "image/jpg"
      }
    },
    "features": {
      "enabled": "boolean",
      "defaultvalues": {
        "format": "string"
      }
    }
  }
}
