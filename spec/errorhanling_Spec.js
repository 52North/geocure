var errorHandling = require("../app/general/errorhandling.js")

describe("app/general/errorhandling.getError", () => {


        it("maps from app/services/statuscodeMapping.json without additional message", done => {
                const errormessage = errorHandling.getError("services", "schemaError")
                const testobj = {
                        "code": 1100,
                        "description": "The file 'app/services/services.json' does not correspond to 'app/services/servicesMetadescription.json'.",
                }
                expect(errormessage).toEqual(testobj);
                done();
        });

        it("maps from app/services/statuscodeMapping.json with additional message", done => {
                const errormessage = errorHandling.getError("services", "schemaError", "Things went wrong")
                const testobj = {
                        "code": 1100,
                        "description": "The file 'app/services/services.json' does not correspond to 'app/services/servicesMetadescription.json'.",
                        "info": "Things went wrong",
                }
                expect(errormessage).toEqual(testobj);
                done();
        });

        it("throws an error if something goes wrong", function(done) {
                expect(() => errorHandling.getError("WrongInput", "schemaError", "Things went wrong")).toThrow("getError - error");
                done();
        });


});
