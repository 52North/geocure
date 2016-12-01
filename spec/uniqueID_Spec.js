const servicesCheck = require("../app/general/servicesCheck.js");

describe("uniqueID", () => {

  /**
   * This function serves as a context of execution fot the function which will be tested.
   * @return {Object} Object whith an id-property
   */
  function context(obj){
    try{
      return servicesCheck.uniqueID(obj);
    }
    catch(error){
      throw error;
    }
  }
  it("should return true, if the current id has not be seen in the current context", done => {
    const dummyobj = {"id" : "unique1"};
    const response = context(dummyobj);
    expect(response).toBe(true);
    done();
  });

  it("returns also a second time true if a not seen id is passed", done => {
    const dummyobj = {"id" : "unique2"};
    const response = context(dummyobj);
    expect(response).toBe(true)
    done();
  });

  it("Throws an error, if a id is seen more than once", done => {
    const dummyobj = {"id" : "unique2"};
    expect(() => context(dummyobj)).toThrow();
    done();
  });
});
