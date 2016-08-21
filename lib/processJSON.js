/**
This library deals with documents in JSON-format.
In our context, it can be getCapabilities or service-descriptions
 **/


/**
Signature: getKeyValueObject : Array, String, String -> Object

Description:
Searches in an Array of objects (objectArray) for a key-value pair (String, String) on the first level.
If the key-value pair is a member of a JSON-Object it will be returned.
Otherwise null will be returned.
**/


 function getKeyValueObject(objectArray, key, value) {
     console.log("At function getKeyValueObject()");

     var result = null;

     for (var i = 0; i < objectArray.length; i++) {
         if (key in objectArray[i]) {
             if (objectArray[i][key] == value) {
                 result = objectArray[i];
                 i = objectArray.length; // found object, so no further iteration required.
             }
         }
     }

     console.log("Finishing function getKeyValueObject()");
     return result;
 }


module.exports = {
  getKeyValueObject : getKeyValueObject
}
