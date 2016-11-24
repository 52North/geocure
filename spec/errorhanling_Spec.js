var errorHandling = require("../app/general/errorhandling.js")

describe("app/general/errorhandling.getError", function() {


    it("maps from app/services/statuscodeMapping.json without additional message", function(done) {
        let errormessage = errorHandling.getError("services", "schemaError")
        let testobj = {
            "code" : 1100,
            "description" : "The file 'app/services/services.json' does not correspond to 'app/services/servicesMetadescription.json'.",
        }
        expect(errormessage).toEqual(testobj);
        done();
    });

    it("maps from app/services/statuscodeMapping.json with additional message", function(done) {
        let errormessage = errorHandling.getError("services", "schemaError", "Things went wrong")
        let testobj = {
            "code" : 1100,
            "description" : "The file 'app/services/services.json' does not correspond to 'app/services/servicesMetadescription.json'.",
            "info" : "Things went wrong",
        }
        expect(errormessage).toEqual(testobj);
        done();
    });
});
