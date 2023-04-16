const { parsePhoneNumber, getCountryCodeForRegionCode } = require('awesome-phonenumber');
const { invalidInputHandler, missingInputHandler } = require("./errors");

function getPhoneNumber(req, res) {
  const { phoneNumber, countryCode } = req.query;

  if (phoneNumber === undefined) return missingInputHandler(res, null, "phoneNumber");
  if (typeof phoneNumber !== 'string') return invalidInputHandler(res, phoneNumber, null, "phoneNumber");
  
  const cleanedPhoneNumber = validateAndCleanPhoneNumber(phoneNumber);
  if (!cleanedPhoneNumber) return invalidInputHandler(res, phoneNumber, null, "phoneNumber");
  
  
  // query awesome-phonenumber without country code
  const phoneNumberLookupResultWithoutCountryCode = parsePhoneNumber('+'+cleanedPhoneNumber);
  if (phoneNumberLookupResultWithoutCountryCode.valid) {
    if (countryCode && countryCode !== phoneNumberLookupResultWithoutCountryCode.regionCode) return invalidInputHandler(res, phoneNumber, countryCode, "countryCode");
    return successfulLookupHandler(res, phoneNumber, null, phoneNumberLookupResultWithoutCountryCode);
  }


  // if execution reaches here, means the phonenumber by itself was insufficient
  if (phoneNumber.length >= 15) return invalidInputHandler(res, phoneNumber, null, "phoneNumber"); // no space for country code even if provided 
  if (countryCode === undefined) return missingInputHandler(res, phoneNumber, "countryCode"); // country code not provided
  if (typeof countryCode !== 'string') return invalidInputHandler(res, phoneNumber, countryCode, "countryCode");


  // convert countryCode to number
  const countryCodeNumeric = getNumericCountryCode(countryCode);
  if (!countryCodeNumeric) return invalidInputHandler(res, phoneNumber, countryCode, "countryCode");

  // query awesome-phonenumber for countryCode + phoneNumber
  const phoneNumberLookupResultWithCountryCode = parsePhoneNumber('+' + countryCodeNumeric + cleanedPhoneNumber);

  if (phoneNumberLookupResultWithCountryCode.valid) {
    // validate that provided countryCode is the same as awesome-phonenumber provided one
    if (phoneNumberLookupResultWithCountryCode.regionCode != countryCode) return invalidInputHandler(res, phoneNumber, null, "countryCode");
    return successfulLookupHandler(res, phoneNumber, countryCode, phoneNumberLookupResultWithCountryCode);
  } else {
    return invalidInputHandler(res, phoneNumber, null,"phoneNumber");   
  } 
}


function successfulLookupHandler(res, inputPhoneNumber, inputCountryCode, phoneNumberLookupResult) {
  const numberData = phoneNumberLookupResult.number;
  const phoneNumber = numberData.input;
  const countryCodeAlpha = phoneNumberLookupResult.regionCode;
  const countryCodeNumeric = phoneNumberLookupResult.countryCode.toString();
  const regex = /-(\d+)-/;
  const areaCode = numberData.rfc3966.match(regex)[1];
  const localPhoneNumber = numberData.significant.slice(areaCode.length, numberData.significant.length);

  // validate spacing
  if (isSpacePlacementValid(inputPhoneNumber, countryCodeNumeric, areaCode, localPhoneNumber)) {
    const successJSON = {
      "phoneNumber" : phoneNumber,
      "countryCode" : countryCodeAlpha,
      "areaCode" : areaCode,
      "localPhoneNumber": localPhoneNumber,
    };
    
    return res.json(successJSON);
  } else {
    return invalidInputHandler(res, inputPhoneNumber, inputCountryCode, "phoneNumber");
  }
}

function isSpacePlacementValid(inputPhoneNumber, countryCode, areaCode, localPhoneNumber) {
  const formattedPhoneNumber = countryCode+ " " +areaCode+ " " +localPhoneNumber;
  if (inputPhoneNumber.charAt(0) === '+') inputPhoneNumber = inputPhoneNumber.slice(1, inputPhoneNumber.length);
  if (inputPhoneNumber.charAt(0) === ' ') return false;
  if (inputPhoneNumber.length > formattedPhoneNumber.length) return false;

  if(inputPhoneNumber.startsWith(countryCode)) {
    inputPhoneNumber = inputPhoneNumber.slice(countryCode.length, inputPhoneNumber.length);
  }

  if (inputPhoneNumber.charAt(0) == " ") {
      inputPhoneNumber = inputPhoneNumber.slice(1, inputPhoneNumber.length);
  }

  if (inputPhoneNumber.startsWith(areaCode)) {
    inputPhoneNumber = inputPhoneNumber.slice(areaCode.length, inputPhoneNumber.length);
  } else return false;

  if (inputPhoneNumber.charAt(0) == " ") inputPhoneNumber = inputPhoneNumber.slice(1, inputPhoneNumber.length);

  if (inputPhoneNumber.startsWith(localPhoneNumber)) {
    inputPhoneNumber = inputPhoneNumber.slice(localPhoneNumber.length, inputPhoneNumber.length);
  } else return false;

  return inputPhoneNumber.length == 0;
}


// *Validates and Cleans Phone Number input*
// Removes starting "+" (if present)
// Checks if first char is space (invalid)
// Checks number of spaces (placement will be checked later)
// Removes spaces
// Validates phone number length is <= 15 and >= 7
// Validates phone number does not contain any non-numbers
// Return: cleaned phoneNumber if valid
// Return: null if invalid
function validateAndCleanPhoneNumber(phoneNumber) {
  if (phoneNumber.charAt(0) === '+')  phoneNumber = phoneNumber.slice(1, phoneNumber.length);
  if (phoneNumber.charAt(0) === ' ') return null;
  if (countSpaces(phoneNumber) > 2) return null;
  phoneNumber = phoneNumber.replace(/\s/g, '');
  if (phoneNumber.length > 15 || phoneNumber.length < 7 || !isValidPhoneNumber(phoneNumber)) {
      return null;
  }
  return phoneNumber;
}


function isValidPhoneNumber(phoneNumber) {
  // Check if phoneNumber only contains numerals
  const regex = /^[0-9]+$/;
  return regex.test(phoneNumber);
}
// isValidCountryCode
function getNumericCountryCode(countryCode) {
  // Check if the countryCode is a valid ISO 3166-1 alpha-2 code
  const regex = /^[A-Za-z]{2}$/;
  if (!regex.test(countryCode)) return null;
  const countryCodeNumeric = getCountryCodeForRegionCode(countryCode)
  return countryCodeNumeric ? countryCodeNumeric : null;
}

function countSpaces(str) {
  const regex = /\s/g;
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}


// Export the getPhoneNumber function
module.exports = {
  getPhoneNumber,

  // for testing
  isValidPhoneNumber,
  getNumericCountryCode,
  countSpaces,
  validateAndCleanPhoneNumber,
  isSpacePlacementValid,
  successfulLookupHandler
};