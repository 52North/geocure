# 52°North geocure

_geocure_ is a REST API providing proxified access to an underlying geodata
server. Currently [geoserver](http://geoserver.org/) in version 10.11-beta is supported.

## Installation

`npm install`

## Execution

`grunt nodemon` or `node app/server.js`

## Deployment with forever

Install [forever](https://github.com/foreverjs/forever)  and
[forever-service](https://github.com/zapty/forever-service) globally:

`[sudo] npm install forever -g`

`[sudo] npm install forever-service -g`

Create a startup script, with the root of the project as CWD:

`[sudo] forever-service install -s app/server.js geocure-forever`

Now, geocure should start as a daemon process when the machine is booted.

## Tests

Unit tests are executed by default `grunt`.

## License

[MIT License](./LICENSE.md)
