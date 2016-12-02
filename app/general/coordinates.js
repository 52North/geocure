const proj4 = require("proj4");
const errorhandling = require("./errorhandling.js");
const transformationParameters = require("../config/transformationParameter.js");

/**
 * Transforms given coordinated from onecoordinate reference system into another.
 * @param  {Number}       x    The x-Value of the coordinates
 * @param  {Number}       y    The y-Value of the coordinates
 * @param  {String}       from Coordinate reference system of the given coodinates
 * @param  {String}       to   The targetsystem
 * @return {Object}            Objext with the properties "x", "y", "crs"
 */
function transformation(x, y, from, to){
  "use strict";
  return new Promise((resolve, reject) => {
    if(!(typeof x === "number" && typeof y === "number")){
      reject(errorhandling.getError("requestResponses","coordinateTransformation", "Not all coordinates are numbers."));
    }

    try{
      proj4.defs(transformationParameters.get());

      const transformed = proj4(from, to, {
        x: x,
        y: y,
        crs: to
      });

            resolve(transformed);
    }
    catch (error) {
      const err = errorhandling.getError("requestResponses","coordinateTransformation", "Unsupported crs.");
      reject(err);
    }

  });
}

// function extentValidation(getCapabilities, )

module.exports = {
  transformation: transformation
}
