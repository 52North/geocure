const wmsServices = require("../app/wms/wmsServices.js");
const servicesdummy = require("./validServicesJSONexample.json");

describe("getServiceDescriptionById", () => {
        it("returns for a valid input the expected result", done => {
                const result = wmsServices.getServiceDescriptionById(servicesdummy, {
                        "fullUrl": "dummyFullURL",
                        "params": {
                                "id": "dummyID"
                        }
                });

                const expected = {"id":"dummyID","label":"Local Testservice","description":"Offers data (points and areas) for development.","capabilities":{"maps":"dummyFullURL/maps","features":"dummyFullURL/features"}};

                expect(result).toEqual(expected);
                done();
        });
})
