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



 /**
 Signature: getBaseURL : Array, String -> String

 Description:
Takes an Array of JSON-Objects and returns for a given id the value of the property "baseURLService".
If no Object in the given Array has the property "id" or the properyvalue of the given String or the property "baseURLService",
then the return value is null.
 **/
 function getBaseURL(ObjectArray, serviceId) {
     console.log("At getBaseURL()");
     var checkedRequest = getKeyValueObject(ObjectArray, "id", serviceId);
     console.log("Value of getKeyValueObject: " + checkedRequest);
     var getBaseURL = checkedRequest.baseURLService;
     console.log("Finishing getBaseURL()");
     return getBaseURL;
 }



/**
Signature: getGetCapabilitiesURL : Array, String -> String

Description: Takes an array of JSON-objects. The first object with the key-value property "id" == serviceId and
the property "baseURLService" will be processed.
Based on the propertyvalue of "baseURLService", the getCapabilities-URL will be constructed and returned.
Otherwise null will be returned.

**/


function getGetCapabilitiesURL(objectArray, serviceId) {
    console.log("At function getCapabilitiesUrl()");
    var checkedRequest = processJSON.getKeyValueObject(objectArray, "id", serviceId);
    var getCapabilitiesUrl = checkedRequest.baseURLService + "wms?request=GetCapabilities&service=wms";
    console.log("Finishing getCapabilitiesUrl()");
    return getCapabilitiesUrl;
}


module.exports = {
  getKeyValueObject : getKeyValueObject,
  getBaseURL : getBaseURL,
  getGetCapabilitiesURL : getGetCapabilitiesURL
}
