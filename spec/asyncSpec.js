const getCapabilities = require("../app/general/getCapabilities.js");
const async = require("../app/general/asyncrone.js");
const expetedWMSGetCapabilities = require("./expetedWMSGetCapabilities.js")

describe("async", () => {
    it("gets capabilities gets the requested object", function(done) {

        const url = "http://localhost:8080/geoserver/geocure/wms?service=WMS&version=1.3.0&request=GetCapabilities";

        function* TestGenerator() {
            try {
                const value = yield getCapabilities.getJSON_WMS(url);
                expect(value).toEqual(expetedWMSGetCapabilities.get());
                done();
            } catch (error) {
                //console.log("CATCH error: " + error);
            }
        }

        async.async(TestGenerator);

    });

    it("gets capabilities pushes two capabilities to an array", function(done) {

        const url = "http://localhost:8080/geoserver/geocure/wms?service=WMS&version=1.3.0&request=GetCapabilities";
        const cache = [];

        function* TestGenerator() {
            try {
                const value1 = yield getCapabilities.getJSON_WMS(url);
                cache.push(value1);
                const value2 = yield getCapabilities.getJSON_WMS(url);
                cache.push(value2);
                expect(cache.length).toBe(2);
                expect(cache).toEqual([expetedWMSGetCapabilities.get(),expetedWMSGetCapabilities.get()]);
                done();
            } catch (error) {
                throw error
            }
        }

        async.async(TestGenerator);

    });

})
