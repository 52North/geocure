const errorhandling = require("../general/errorhandling.js");

function getAllServices(services, requestargs) {
        "use strict";
        const response = [];
        services.forEach(service => {
                try {
                        const description = {};
                        if (service.capabilities.maps.enabled || services.capabilities.features.enabled) {
                                description["id"] = service.id;
                                description["label"] = service.label;
                                description["description"] = service.description;
                                description["href"] = requestargs.fullUrl + "/" + service.id;
                                response.push(description);
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
