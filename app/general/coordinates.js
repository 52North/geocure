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
  
  if(!(typeof x === "number" && typeof y === "number")){
    throw errorhandling.getError("requestResponses","coordinateTransformation", "Not all coordinates are numbers.");
  }

  try{
    proj4.defs(transformationParameters.get());

    const transformed = proj4(from, to, {
      x: x,
      y: y,
      crs: to
    });


    return transformed;

  }
  catch (error) {
    throw errorhandling.getError("requestResponses","coordinateTransformation", ("'" + error + "'is not supported."));
  }

}

// function extentValidation(getCapabilities, )

module.exports = {
  transformation: transformation
}
