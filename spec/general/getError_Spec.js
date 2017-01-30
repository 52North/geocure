var errorHandling = require("../../app/general/errorhandling.js")

describe("getError()", () => {

  const errorObject = {
    statuscode : undefined,
    exceptions : [
      {
        code : undefined,
        locator : undefined,
        text : undefined
      }
    ]
  }

      it("should return a default object, if no arguments are given", done => {
        expect(errorHandling.getError()).toEqual(errorObject);
        done();
      });

      it("should should change the attributes, if arguments are given", done => {
        errorObject.statuscode = 503;
        errorObject.exceptions[0].code = "abc";
        errorObject.exceptions[0].locator = "def";
        errorObject.exceptions[0].text = "ghi";

        expect(errorHandling.getError(503, "abc", "def", "ghi")).toEqual(errorObject);
        done();
      });


});
