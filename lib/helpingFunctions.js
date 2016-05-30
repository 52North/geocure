// Signatur: verifyObjectId : json objectID -> result
// Description: Consumes a JSON (json) and a string (objectID) and returns an Object.
// result[0] contains a Boolean which indicates whether the id was found in the json.
// result[1] contains the object, with the id or NULL.

function verifyObjectId(json, objectID) {

    var result = {idFound: false, object: null};

    for (var i = 0; i < json.length; i++) {
        if ("id" in json[i]) {
            if (json[i].id == objectID) {
              result.idFound = true;
              result.object = json[i];
              i = json.length; // found object, so no further iteration required.
            }
        }
    }
    return result;
}

module.exports.verifyObjectId = verifyObjectId;
