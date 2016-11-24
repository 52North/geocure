var statuscodeMapping = require("../config/statuscodeMapping.json")


/**
 * This function generates errors.
 * Taking information from statuscodeMapping.json
 * it returns new error-objects.
 * @param  {[type]} category [The "top-level" description. Example: services (see statuscodeMapping)]
 * @param  {[type]} type     [The "child" of the "top-level" description. Example: schemaError ("...")]
 * @param  {[type]} info     [Optional information.]
 * @return {[type]}          [An error-Object]
 */

function getError(category, type, info) {
    "use strict";

    try {
        console.log("Parameterchecking getError = " + JSON.stringify(arguments));
        const response = new Error(category.toString() + " " + type.toString());

        const statuscodePraefix = statuscodeMapping[category]["praefix"];
        const mappingObject = JSON.parse(JSON.stringify(statuscodeMapping[category][type])); // Make a copy of the statuscodeMapping-Object

        response["code"] = statuscodePraefix + mappingObject["code"];
        response["description"] = mappingObject["description"];


        if (info) {
            response["info"] = info;
        }

        return response;

    } catch (error) {
        throw new Error("getError function")
    }
}


module.exports = {
    getError: getError
};
