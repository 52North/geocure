const serviceConfiguration = require("../config/statuscodeMapping.json");
const errorhandling = require("./errorhandling.js");


/**
 * Wrapper-function for checkObject.
 * checkObject will be applied to each element of the passed Array
 * @param  {Array} objectArray      Contains the objects which are to be tested
 * @param  {JSON} metadescription   Description how the an object should look like
 * @return {Boolean}                true, if everything is ok.
 * @throws {Error}                  If an object and the metadescription do not fit.
 */
function check(objectArray, metadescription) {
    try {
        for (let element of objectArray) {
            checkObject(element, metadescription);
        }

    } catch (error) {
        throw error;
    }

    return true;
}

/**
 * Checks a single object if it fits to a given specification
 * @param  {object} obj             The object, for which keys and values the test will be performed
 * @param  {JSON} metadescription   How the object should be structured
 * @return {Boolean}                true, if everything is ok
 * @throws {Error}                  If the tests are not passed
 */
function checkObject(obj, metadescription) {

    try {

        for (let key in obj) {

            let checkOK = typeof(metadescription[key]) === "object" ? checkObject(obj[key], metadescription[key]) : typeof(obj[key]) === metadescription[key];


            if (checkOK === false) {

                throw errorhandling.getError("services", "schemaError");
            }

        }

    } catch (error) {

        throw error;
    }

    return true;

}


module.exports = {
    check: check,
    checkObject: checkObject
};
