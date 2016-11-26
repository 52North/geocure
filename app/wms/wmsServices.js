const errorhandling = require("../general/errorhandling.js");

/**
 * Constructs the output for the endpoint /services.
 * It is based on the description of the services, given in services.json
 * @method getAllServices
 * @param  {JSON}       services      The description of the services
 * @param  {Object}     requestargs   Describing the request
 * @return {JSON}                     Description of all offered and enabled services
 * @throws {Error}
 */
function getAllServices(services, requestargs) {
        "use strict";
        const response = [];
        services.forEach(service => {
                try {
                        const description = {};
                        /**
                         * logs for tests
                         */
                        // console.log("********************")
                        // console.log("service.id = " + service.id)
                        // console.log("service.label = " + service.label)
                        // console.log("service.description = " + service.description)
                        // console.log("requestargs.fullUrl = " + requestargs.fullUrl)
                        // console.log("*********************")
                        if (service.capabilities.maps.enabled || services.capabilities.features.enabled) {
                                if (service.id && service.label && service.description && requestargs.fullUrl) {
                                        description["id"] = service.id;
                                        description["label"] = service.label;
                                        description["description"] = service.description;
                                        description["href"] = requestargs.fullUrl + "/" + service.id;
                                        response.push(description);
                                } else {
                                        throw errorhandling.getError("requestResponses", "/services", "Not all attributes available");
                                }
                        }
                } catch (error) {
                        throw errorhandling.getError("requestResponses", "/services", error);
                }

        });

        return response;
}

module.exports = {
        getAllServices: getAllServices
}
