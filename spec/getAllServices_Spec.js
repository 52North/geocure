const wmsServices = require("../app/wms/wmsServices.js");

describe("getAllServices", () => {
        it("returns a valid Array if the input is correct", (done) => {

                const result = wmsServices.getAllServices(services0, requestarg);
                expect(result).toEqual([]);
                done();


        });

        it("Test the test", (done) => {

                const result = wmsServices.getAllServices(services0, requestarg);
                expect(result).not.toEqual([{}]);
                done();


        });

        it("works with one object", (done) => {

                const result = wmsServices.getAllServices(services1, requestarg);
                const expected = [{
                        "id": "local01",
                        "label": "Local Testservice",
                        "description": "Offers data (points and areas) for development.",
                        "href": "FULL_URL_HERE/local01"
                }]
                expect(result).toEqual(expected);
                done();
        });

        it("works with two objects", (done) => {

                const result = wmsServices.getAllServices(services2, requestarg);
                const expected = [{
                        "id": "local02",
                        "label": "Local Testservice",
                        "description": "Offers data (points and areas) for development.",
                        "href": "FULL_URL_HERE/local02"
                }, {
                        "id": "local0202",
                        "label": "Local Testservice",
                        "description": "Offers data (points and areas) for development.",
                        "href": "FULL_URL_HERE/local0202"
                }]
                expect(result).toEqual(expected);
                done();
        });


        it("Throws an error as expected", (done) => {



                expect(() =>
                        wmsServices.getAllServices(flawed1, requestarg)
                ).toThrow()
                done();
        });


        it("throws the expected error", (done) => {
                expect(() =>
                        wmsServices.getAllServices(flawed1, requestarg)).toThrow("requestResponses /services");
                done();
        });



})


/**
 * Dummy-request-Object
 */

const requestarg = {
        fullUrl: "FULL_URL_HERE"
}

/**
 * Valid Services
 */

const services0 = [];

const services1 = [{
        "id": "local01",
        "label": "Local Testservice",
        "description": "Offers data (points and areas) for development.",
        "url": "http://localhost:8080/geoserver/geocure",
        "capabilities": {
                "maps": {
                        "enabled": true,
                        "defaultvalues": {
                                "width": 1330,
                                "height": 944,
                                "format": "image/png"
                        }

                },
                "features": {
                        "enabled": false,
                        "defaultvalues": {
                                "format": "application/json"
                        }
                }
        }

}];



const services2 = [{
        "id": "local02",
        "label": "Local Testservice",
        "description": "Offers data (points and areas) for development.",
        "url": "http://localhost:8080/geoserver/geocure",
        "capabilities": {
                "maps": {
                        "enabled": true,
                        "defaultvalues": {
                                "width": 1330,
                                "height": 944,
                                "format": "image/png"
                        }

                },
                "features": {
                        "enabled": false,
                        "defaultvalues": {
                                "format": "application/json"
                        }
                }
        }

}, {
        "id": "local0202",
        "label": "Local Testservice",
        "description": "Offers data (points and areas) for development.",
        "url": "http://localhost:8080/geoserver/geocure",
        "capabilities": {
                "maps": {
                        "enabled": true,
                        "defaultvalues": {
                                "width": 1330,
                                "height": 944,
                                "format": "image/png"
                        }

                },
                "features": {
                        "enabled": false,
                        "defaultvalues": {
                                "format": "application/json"
                        }
                }
        }

}];


/**
 * Flawed configuration
 */

const flawed1 = [{
        "id": "flawed01",
        "label": "Local Testservice",
        "deon": "Offers data (points and areas) for development.",
        "href": "FULL_URL_HERE/local01"
}]
