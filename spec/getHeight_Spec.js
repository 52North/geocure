const requestsURL = require("../app/wms/requestsURL.js");

describe("getHeight", () => {
  it("returns for a valid request the requested value.", done => {
    expect(requestsURL.getHeight({}, {height: 1})).toEqual(1);
    done();
  });
  it("returns for a valid request the requested value. - counter check", done => {
    expect(requestsURL.getHeight({}, {height: 1})).not.toEqual(2);
    done();
  });

  it("returns returns a valid default argument", done => {
    expect(requestsURL.getHeight(validConfig, {})).toEqual(500);
    done();
  });
  it("returns returns a valid default argument - counter check", done => {
    expect(requestsURL.getHeight(validConfig, {})).not.toEqual(200);
    done();
  });
  it("throws an error for an invalid config", done => {
    expect(() => requestsURL.getHeight(inValidConfig, {})).toThrow();
    done();
  });
  it("throws an error for an invalid request - abc", done => {
    expect(() => requestsURL.getHeight({}, {height: "abc"})).toThrow();
    done();
  });
  it("throws an error for an invalid request - 0", done => {
    expect(() => requestsURL.getHeight({}, {height: 0})).toThrow();
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
        "height": 0,
        "height": 0,
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
