
/**
 * Returns an object to communicate an errorObject
 * The structure is based on the exception = application/json errors from GeoServer.
 * Only the first property - statuscode - is different (GeoServer uses 'version').
 * @method getError
 * @param  {Number} statuscode Statuscode for the HTTP response
 * @param  {String} code       Short errordescription
 * @param  {String} locator    Where the error occured
 * @param  {String} text       Description of the error
 * @return {object}            The error-object
 */
function getError(statuscode, code, locator, text) {

          const errorObject = {
            statuscode : "not specified",
            exceptions : [
              {
                code : "not specified",
                locator : "not specified",
                text : "not specified"
              }
            ]
          }

        errorObject.statuscode = statuscode;
        errorObject.exceptions[0].code = code;
        errorObject.exceptions[0].locator = locator;
        errorObject.exceptions[0].text = text;

        return errorObject;
}


module.exports = {
        getError: getError
};
