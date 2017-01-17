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
                                        throw errorhandling.getError(500, "AttributeError", "getAllServices", "Not all attributes available");
                                }
                        }
                } catch (error) {
                        throw error;
                }

        });

        return response;
}



/**
 * Constructs a description of a service.
 * The result will be infulenced by the status of the enablement of maps/features (see services.json)
 * @param  {Array}       services    Servicedescription, structured like in services.json
 * @param  {Object}      requestargs Contains the id of the requested service
 * @return {Object}                   Information about the service, its capabilities (maps, features)
 */
function getServiceDescriptionById(services, requestargs) {
        "use strict";
        try {
                const allServices = getAllServices(services, requestargs);
                const serviceById = allServices.find(service => {
                        return service.id == requestargs.params.id
                })

                if (!serviceById) {
                        throw errorhandling.getError(400, "Not found", "getServiceDescriptionById", "No service for requested id");
                }


                // Having a look at services.json so I can see in the following which capabilities are enabled
                const serviceConfiguration = services.find(service => {
                        return service.id == requestargs.params.id;
                })

                const capabilities = {};

                // By "for (let prop in obj)" we are more flexible, if a capabilitie is added to server.json
                for (let key in serviceConfiguration["capabilities"]) {
                        if (serviceConfiguration["capabilities"][key]["enabled"]) {
                                capabilities[key] = requestargs.fullUrl + "/" + key;
                        }
                }

                // Basically we have everything. Only the property 'href' is superfluous.
                delete serviceById["href"];
                serviceById["capabilities"] = capabilities;

                return serviceById;


        } catch (error) {
                throw error;
        }
}

module.exports = {
        getAllServices: getAllServices,
        getServiceDescriptionById: getServiceDescriptionById
}
