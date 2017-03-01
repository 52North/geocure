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
        "use strict";
        try {
                for (let element of objectArray) {
                        checkObject(element, metadescription);
                        uniqueID(element);
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
        "use strict";
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


/**
 * Takes in object with a id-property and checks whether the value of obj.id has been seen before
 * If so, an error will be thrown
 * @param  {Object} obj  Object should have the property obj.id
 * @return {Boolean}     true if the current id has not been seen before.
 * @throws {Error}       Otherwise
 */
function uniqueID(obj){
  if(!obj.id){
    // Should not be thrown due to previous test of the compliance whith the servicesSpec.js
    throw errorhandling.getError("services", "schemaError", "obj.id is undefined")
  }
  // Context will be the function check
  if(!this.ids){
    this["ids"] = [obj.id];
  }
  else{
    if(this.ids.find(id => {return id == obj.id})){
      throw errorhandling.getError("services", "schemaError", ("id '" + obj.id +"' is not unique"));
    }
    else {
      this.ids.push(obj.id);
    }
  }

  return true;
}


module.exports = {
        check: check,
        checkObject: checkObject,
        uniqueID: uniqueID
};
