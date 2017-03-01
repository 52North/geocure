const validServices = require("./validServices.json");
const requestsURL = require("../../app/wms/requestsURL.js");
const dummyCache = require("./dummyWMSCache.js");

const req = {fullUrl: "http://localhost:8002/services", params : {id : "local01"}, fullUrl : "http://localhost:8002/services/local01/maps"};



describe("getMapURL", () => {

it("if no parameter are given, it should return a valid url", done => {
  expect(requestsURL.getMapURL(dummyCache, req, validServices)).toEqual(expectedValidUrl);
done();
});

});

const expectedValidUrl = "http://localhost:8080/geoserver/topp/wms?SERVICE=wms&VERSION=1.3&REQUEST=GetMap&LAYERS=map,map_neue_zusaetzliche&STYLES=&CRS=EPSG:4326&BBOX=29.327170000004116,-11.745699999999488,40.44322000001557,-0.9820300000001225&WIDTH=1330&HEIGHT=944&FORMAT=image/png&TRANSPARENT=false&BGCOLOR=0xFFFFFF&EXCEPTIONS=json";
