let servicesCheck = require("../app/general/servicesCheck");
let servicesMetadescription = require("../app/config/servicesSpec.json");

describe("The function a/app/lib/general/serverSetup/servicesCheck.checkObject", function() {


    it("checks returns true for a correct configuration of an object", function(done) {

        expect(servicesCheck.checkObject(correctConfiguration, servicesMetadescription)).toBe(true);
        done();
    });


    it("returns an error-object for a wrong configuration of an object", function(done) {


        expect(() => servicesCheck.checkObject(wrongConfiguration_01, servicesMetadescription)).toThrow();
        done();
    });


    it("returns an error-object for a wrong configuration if map is not an object in an object", function(done) {

        expect(() => servicesCheck.checkObject(wrongConfiguration_02, servicesMetadescription)).toThrow();
        done();
    });



    it("returns an error-object for a wrong configuration in maps of" , function(done) {



        expect(() => servicesCheck.checkObject(wrongConfiguration_03, servicesMetadescription)).toThrow();
        done();
    });



    it("returns an error-object for a wrong configuration in features of ", function(done) {


        expect(() => servicesCheck.checkObject(wrongConfiguration_04, servicesMetadescription)).toThrow();
        done();
    });


});



describe("The function a/app/lib/general/serverSetup/servicesCheck.check", function() {


    it("checks returns true for a correct configuration of on array with one object", function(done) {

        expect(servicesCheck.check(correctArray_01, servicesMetadescription)).toBe(true);
        done();
    });

    it("checks returns true for a correct configuration of on array with two object", function(done) {

        expect(servicesCheck.check(correctArray_02, servicesMetadescription)).toBe(true);
        done();
    });

    it("checks returns true for a correct configuration of on array with three object", function(done) {

        expect(servicesCheck.check(correctArray_03, servicesMetadescription)).toBe(true);
        done();
    });

    it("checks throws an error for a correct configuration of on array with one object", function(done) {

        expect(() => servicesCheck.check(wrongArray_01, servicesMetadescription)).toThrow();
        done();
    });

    it("checks throws an error for a correct configuration of on array with two object", function(done) {

        expect(() => servicesCheck.check(wrongArray_02, servicesMetadescription)).toThrow();
        done();
    });

    it("checks throws an error for a correct configuration of on array with two object (reversed order of elements)", function(done) {

        expect(() => servicesCheck.check(wrongArray_03, servicesMetadescription)).toThrow();
        done();
    });

    it("checks throws an error for a correct configuration of on array with three objects. Wrong configuration in the middel.", function(done) {

        expect(() => servicesCheck.check(wrongArray_04, servicesMetadescription)).toThrow();
        done();
    });



});



// Examplekonfig
// Correct Configuration:
const correctConfiguration =
{
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

};


// Wrong configurations

const wrongConfiguration_01 =
{
    "id": "local01",
    "label": "Local Testservice",
    "description": 2,
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

};

const wrongConfiguration_02 =
{
    "id": "local01",
    "label": "Local Testservice",
    "description": "description",
    "url": "http://localhost:8080/geoserver/geocure",
    "capabilities": {
        "maps": 6

    },
    "features": {
        "enabled": false,
        "defaultvalues": {
            "format": "application/json"
        }
    }
};

const wrongConfiguration_03 =
{
    "id": "local01",
    "label": "Local Testservice",
    "description": 2,
    "url": "http://localhost:8080/geoserver/geocure",
    "capabilities": {
        "maps": {
            "enabled": true,
            "defaultvalues": {
                "width": 1330,
                "height": "944",
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

};


const wrongConfiguration_04 =
{
    "id": "local01",
    "label": "Local Testservice",
    "description": 2,
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
                "format": true
            }
        }
    }

};



// Array
const correctArray_01=[correctConfiguration];
const correctArray_02=[correctConfiguration, correctConfiguration];
const correctArray_03=[correctConfiguration, correctConfiguration, correctConfiguration];

const wrongArray_01=[wrongConfiguration_01];
const wrongArray_02=[correctConfiguration, wrongConfiguration_01];
const wrongArray_03=[wrongConfiguration_01, correctConfiguration];
const correctArray_04=[correctConfiguration, wrongConfiguration_04, correctConfiguration];
