const urlConstructor = require("../app/general/url.js");

describe("The iterator from URLBaseGenerator", function(){

  it("creates a basic concatenation", function(done){
    const arg = ["wms", "1.3.0"];
    let res;

    const urlBaseIterator = urlConstructor.URLBaseGenerator("abc");
    // initial generatorCall so we can pass values to yield via next()
    urlBaseIterator.next();

    arg.forEach((value) => {
      let next = urlBaseIterator.next(value);
      res = next.value;
    });

      expect(res).toBe("abc?SERVICE=wms&VERSION=1.3.0");
      done();
  })
});

describe("baseURL", function(){

  it("creates a basic concatenation", function(done){
    const arg = ["wms", "1.3.0"];
    const serviceURL = "abc";

    const res = urlConstructor.getBaseURL(serviceURL, arg);
      expect(res).toBe("abc?SERVICE=wms&VERSION=1.3.0");
      done();
  })
});
