const coordinates = require("../app/general/coordinates.js");


describe("transformation", () => {

  it("does not changed coodinates if from and to are equal", done => {

    coordinates.transformation(8.1241245, 51.12124, "EPSG:4326", "EPSG:4326").then(response => {expect(response).toEqual({ x : 8.1241245, y : 51.12124, crs : 'EPSG:4326' }); done();});
  });

  it("throws an error, if a not supported crs is the source.", done => {
    coordinates.transformation(8.1241245, 51.12124, "1234", "EPSG:4326").then(() => {expect("Should not be resolved").toBe("Error"); done();}).catch(response => {expect(response).toEqual({ code : 3050, description : 'An error occured during corrdinate transformation.', info : 'Unsupported crs.' }); done();});
  });

  it("throws an error, if a not supported crs is the target.", done => {
    coordinates.transformation(8.1241245, 51.12124, "EPSG:4326", "1234").then(() => {expect("Should not be resolved").toBe("Error"); done();}).catch(response => {expect(response).toEqual({ code : 3050, description : 'An error occured during corrdinate transformation.', info : 'Unsupported crs.' }); done();});
  });

  it("transforms as expected", done => {
    coordinates.transformation(18.5, 54.2, "EPSG:4326", "EPSG:3857").then(response => {expect(response).toEqual({ x : 2059410.579675561, y : 7208125.260900678, crs : 'EPSG:3857' }); done();})
  });

  it("transforms as expected back", done => {
    coordinates.transformation(2059410.579675561, 7208125.260900678, "EPSG:3857", "EPSG:4326").then(response => {expect(response).toEqual({ x : 18.5, y : 54.20000000000001, crs : 'EPSG:4326' }); done();})
  });

  it("throws an error if a coordinate is not valid", done => {
    coordinates.transformation(2059410.579675561, "7208125.26090?0678", "EPSG:3857", "EPSG:4326").then(() => {expect("Should not be resolved").toBe("Error"); done();}).catch(response => {expect(response).toEqual({ code : 3050, description : 'An error occured during corrdinate transformation.', info : 'Not all coordinates are numbers.' }); done();});
  });

})
