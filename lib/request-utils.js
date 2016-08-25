/**
Processes URLs
**/

/**
Signature: injectFullUrl : Object-> Object

Description: Returns full request URL.

**/
function injectFullUrl(req) {
  req.fullUrl = (req.isSecure()) ? 'https' : 'http' + '://' + req.headers.host + req.url;
  return req;
}

module.exports.injectFullUrl = injectFullUrl;
