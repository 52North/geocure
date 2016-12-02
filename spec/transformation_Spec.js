const coordinates = require("../app/general/coordinates.js");

describe("transformation", () => {
  it("does not changed coodinates if from and to are equal", done => {
    const response = coordinates.transformation(8.1241245, 51.12124, "EPSG:4326", "EPSG:4326");
    expect(response).toEqual({x: 8.1241245, y: 51.12124, crs: "EPSG:4326"});
    done();
  });

  it("throws an error, if a not supported crs is the source.", done => {
    expect(() => coordinates.transformation(8.1241245, 51.12124, "1234", "EPSG:4326")).toThrow();
    done();
  });

  it("throws an error, if a not supported crs is the target.", done => {
    expect(() => coordinates.transformation(8.1241245, 51.12124, "EPSG:4326", "1234")).toThrow();
    done();
  });

  it("transforms as expected", done => {

    const response = coordinates.transformation(18.5, 54.2, "EPSG:4326", "EPSG:3857");
    expect(response).toEqual({ x : 2059410.579675561, y : 7208125.260900678, crs : 'EPSG:3857' });
    done();
  });

  it("transforms as expected back", done => {

    const response = coordinates.transformation(2059410.579675561, 7208125.260900678, "EPSG:3857", "EPSG:4326");
    expect(response).toEqual({ x : 18.5, y : 54.20000000000001, crs : 'EPSG:4326' });
    done();
  });

})
