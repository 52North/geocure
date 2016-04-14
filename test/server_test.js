var should = require('should');
var geobase = require('../lib/server');

describe('testRoutes', function () {
  it('testRoutes', function (done) {
    geobase.server.routes.get.should.not.be.null;
    done();
  });
});
