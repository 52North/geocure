const requestURL = require("../app/wms/requestsURL.js");

describe("getCapabilities", function(){
  it("returns the expeded concatenation", done => {
    const res = requestURL.getCapabilities("abc");
    expect(res).toBe("abc?SERVICE=wms&VERSION=1.3.0&REQUEST=getCapabilities")
    done();
  })
});
