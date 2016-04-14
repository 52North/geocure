var restify = require('restify');
var restifySwagger = require('node-restify-swagger');
var requestUtils = require('./request-utils');

var server = module.exports.server = restify.createServer();

server.name = 'geocure';

server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.bodyParser());

restifySwagger.configure(server, {
  info: {
    title: '52°North geocure API',
    description: '52°North geocure API',
    contact: 'm.rieke@52north.org',
    license: 'MIT',
    licenseUrl: 'http://opensource.org/licenses/MIT'
  },
  apiDescriptions: {
    'get':'GET API',
    'post':'POST API for complex requests'
  }
});

/**
* API Docs contents
* see http://mcavage.me/node-restify/#serve-static for usage
**/
server.get(/\/apidocs\/?.*/, restify.serveStatic({
  directory: './documentation',
  default: 'index.html'
}));
server.get('/', function (req, res, next) {
  res.header('Location', '/apidocs/index.html');
  res.send(302);
  return next(false);
});

/**
* Services Resource base controller
*/
server.get({url: '/services',
swagger: {
  summary: 'services resource',
  notes: 'this resource provides access to geodata services',
}}, function (req, res, next) {
  requestUtils.injectFullUrl(req);
  res.send([
    {
      service1: req.fullUrl+'/service1234'
    }
    ]
  );
});

/**
* Service entry Resource base controller
*/
server.get({url: '/services/:id',
swagger: {
  summary: 'service entry resource',
  notes: 'this resource provides access to a geodata service',
}}, function (req, res, next) {
  res.send(req.params);
});

restifySwagger.loadRestifyRoutes();

/**
* Start server
*/
server.listen(8001, function () {
  console.log('%s started: %s', server.name, server.url);
});
