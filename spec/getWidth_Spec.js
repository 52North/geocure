const requestsURL = require("../app/wms/requestsURL.js");

describe("getWidth", () => {
  it("returns for a valid request the requested value.", done => {
    expect(requestsURL.getWidth({}, {width: 1})).toEqual(1);
    done();
  });
  it("returns for a valid request the requested value. - counter check", done => {
    expect(requestsURL.getWidth({}, {width: 1})).not.toEqual(2);
    done();
  });

  it("returns returns a valid default argument", done => {
    expect(requestsURL.getWidth(validConfig, {})).toEqual(500);
    done();
  });
  it("returns returns a valid default argument - counter check", done => {
    expect(requestsURL.getWidth(validConfig, {})).not.toEqual(200);
    done();
  });
  it("throws an error for an invalid config", done => {
    expect(() => requestsURL.getWidth(inValidConfig, {})).toThrow();
    done();
  });
  it("throws an error for an invalid request - abc", done => {
    expect(() => requestsURL.getWidth({}, {width: "abc"})).toThrow();
    done();
  });
  it("throws an error for an invalid request - 0", done => {
    expect(() => requestsURL.getWidth({}, {width: 0})).toThrow();
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
        "width": 500,
        "height": "number",
        "format": "string"
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

const inValidConfig = {
  "id": "string",
  "label": "string",
  "description": "string",
  "url": "string",
  "capabilities": {
    "maps": {
      "enabled": "boolean",
      "defaultvalues": {
        "width": 0,
        "height": "number",
        "format": "string"
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
