var should = require('should');
var geocure = require('../lib/server');
var requestUtils = require('../lib/request-utils');

describe('testRoutes', function () {
  it('testRoutes', function (done) {
    geocure.server.routes.get.should.not.be.null;
    done();
  });
});

describe('testFullUrl', function () {
  it('testFullUrl', function (done) {
    var dummy = {};
    dummy.isSecure = function() {
      return false;
    };
    dummy.headers = {};
    dummy.headers.host = 'localhost';
    dummy.url = '/test';
    requestUtils.injectFullUrl(dummy);
    dummy.fullUrl.should.equal('http://localhost/test');
    done();
  });
});
