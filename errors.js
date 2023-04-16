/*This file contains all possible errors that may occur and handlers for each type of error
 These are the error types:
 1) Invalid Input
 3) Missing Required Input
 
 Upon all errors, a JSON object is returned to the user

Error 3)
{
    "error" : {
        "phoneNumber" : "required value is missing"
    }
}
 */


/* Handles Error 1)
Sends JSON object to user:
    {
        "phoneNumber" : <user inputted phone number>
        "error" : {
            "phoneNumber" : "invalid"
        }
    }
*/
function invalidInputHandler(res, phoneNumber, countryCode, invalidParamType) {
    var displayJson;
    if (countryCode) {
        displayJson = { "phoneNumber": phoneNumber, "countryCode": countryCode, "error" : {[invalidParamType]: "invalid input"} };
    } else {
        displayJson= { "phoneNumber": phoneNumber, "error" : {[invalidParamType]: "invalid input"} };
    }
    return res.json(displayJson);
}


/* Handles Error 2)
Sends JSON object to user:
    {
        "phoneNumber" : <user inputted phone number>
        "error" : {
            "countryCode" : "required value is missing"
        }
    }
*/
function missingInputHandler(res, phoneNumber, missingParamType) {
    var displayJson;
    if (phoneNumber) {
        displayJson = { "phoneNumber": phoneNumber, "error": { [missingParamType]: "required value is missing" } };
    } else {
        displayJson = { "error": { [missingParamType]: "required value is missing" } };
    }
    return res.json(displayJson);
}


//export all functions
module.exports = {
    invalidInputHandler,
    missingInputHandler
}
    





