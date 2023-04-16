const assert = require('assert');
const { isValidPhoneNumber, getNumericCountryCode, countSpaces, validateAndCleanPhoneNumber, isSpacePlacementValid, successfulLookupHandler, getPhoneNumber } = require("./phone-number");

const Res = class {
    constructor() {}
    json(x) {
      return x;
    }
}

const Req = class {
    constructor(query) {
        this.query = query;
    }
}


const NumberData = class {
    constructor(input, rfc3966, significant) {
        this.input = input;
        this.rfc3966 = rfc3966;
        this.significant = significant;
    }
}

const LookupResult = class {
    constructor(numberData, regionCode, countryCode, valid) {
        this.number = numberData;
        this.regionCode = regionCode;
        this.countryCode = countryCode;
        this.valid = valid;
    }
}

describe('Unit Tests', function () {
    // isValidPhoneNumber
    it('isValidPhoneNumber should return true for a valid phone number', () => {
        assert.strictEqual(isValidPhoneNumber('12125690123'), true);
    });
    it('isValidPhoneNumber should return false for an invalid phone number', () => {
        assert.strictEqual(isValidPhoneNumber('aa12312412344'), false);
    });

    // getNumericCountryCode
    it('getNumericCountryCode should return numeric country code for valid input', () => {
        assert.strictEqual(getNumericCountryCode('US'), 1);
    });

    it('getNumericCountryCode should return null for invalid input', () => {
        assert.strictEqual(getNumericCountryCode('USA'), null);
    });

    // countSpaces
    it('countSpaces should return # of spaces', () => {
        assert.strictEqual(countSpaces('asdfadsfasdfada'), 0);
        assert.strictEqual(countSpaces(' 1 '), 2);
        assert.strictEqual(countSpaces(' '), 1);
        assert.strictEqual(countSpaces(''), 0);
    });

    // validateAndCleanPhoneNumber
    it('validateAndCleanPhoneNumber should return cleaned phoneNumber for valid input', () => {
        assert.strictEqual(validateAndCleanPhoneNumber('6573310806'), '6573310806');
        assert.strictEqual(validateAndCleanPhoneNumber('+6573310806'), '6573310806');
        assert.strictEqual(validateAndCleanPhoneNumber('657 331 0806'), '6573310806');
        assert.strictEqual(validateAndCleanPhoneNumber('657 3310806'), '6573310806');
    });

    it('validateAndCleanPhoneNumber should return null phoneNumber for invalid input', () => {
        assert.strictEqual(validateAndCleanPhoneNumber('1234567890123456'), null);
        assert.strictEqual(validateAndCleanPhoneNumber('657asfsaa806'), null);
        assert.strictEqual(validateAndCleanPhoneNumber(' 657 331 0806'), null);
    });


    // isSpacePlacementValid isSpacePlacementValid(inputPhoneNumber, countryCodeNumeric, areaCode, localPhoneNumber)
    it('isSpacePlacementValid returns true for valid input', () => {
        assert.strictEqual(isSpacePlacementValid('6573310806', "1", '657', '3310806'), true);
        assert.strictEqual(isSpacePlacementValid('+6573310806', "1", '657', '3310806'), true);
        assert.strictEqual(isSpacePlacementValid('16573310806', "1", '657', '3310806'), true);
        assert.strictEqual(isSpacePlacementValid('1 657 3310806', "1", '657', '3310806'), true);
        assert.strictEqual(isSpacePlacementValid('+1 657 3310806', "1", '657', '3310806'), true);
    });

    it('isSpacePlacementValid returns false for invalid input', () => {
        assert.strictEqual(isSpacePlacementValid('657 331 0806', "1", '657', '3310806'), false);
        assert.strictEqual(isSpacePlacementValid('6 5 7 3 3 1 0 8 0 6', "1", '657', '3310806'), false);
    });

    // function successfulLookupHandler(res, inputPhoneNumber, phoneNumberLookupResult) {
    it('successfulLookupHandler returns correct JSON for valid input (with countryCode)', () => {
        const mockNumberdata = new NumberData('+6573310806', 'tel:+1-657-331-0806', '6573310806');
        const mockLookupResult = new LookupResult(mockNumberdata, 'US', 1, true);
        const mockRes = new Res();

        const returnJson = successfulLookupHandler(mockRes, '+6573310806', 'US', mockLookupResult);
        assert.strictEqual(returnJson.phoneNumber, '+6573310806');
        assert.strictEqual(returnJson.countryCode, 'US');
        assert.strictEqual(returnJson.areaCode, '657');
        assert.strictEqual(returnJson.localPhoneNumber, '3310806');
    });

    it('successfulLookupHandler returns correct JSON for valid input (without countryCode)', () => {
        const mockNumberdata = new NumberData('+6573310806', 'tel:+1-657-331-0806', '6573310806');
        const mockLookupResult = new LookupResult(mockNumberdata, 'US', 1, true);
        const mockRes = new Res();

        const returnJson = successfulLookupHandler(mockRes, '+6573310806', null, mockLookupResult);
        assert.strictEqual(returnJson.phoneNumber, '+6573310806');
        assert.strictEqual(returnJson.countryCode, 'US');
        assert.strictEqual(returnJson.areaCode, '657');
        assert.strictEqual(returnJson.localPhoneNumber, '3310806');
    });

    it('successfulLookupHandler returns error JSON for invalid input (with countryCode)', () => {
        const mockNumberdata = new NumberData(' 657 331 0806', 'tel:+1-657-331-0806', '6573310806');
        const mockLookupResult = new LookupResult(mockNumberdata, 'US', 1, true);
        const mockRes = new Res();

        const returnJson = successfulLookupHandler(mockRes, ' 657 331 0806', 'US', mockLookupResult);
        assert.strictEqual(returnJson.phoneNumber, ' 657 331 0806');
        assert.strictEqual(returnJson.countryCode, 'US');
        assert.strictEqual(returnJson.areaCode, undefined);
        assert.strictEqual(returnJson.localPhoneNumber, undefined);
    });

    it('successfulLookupHandler returns error JSON for invalid input (without countryCode)', () => {
        const mockNumberdata = new NumberData(' 657 331 0806', 'tel:+1-657-331-0806', '6573310806');
        const mockLookupResult = new LookupResult(mockNumberdata, 'US', 1, true);
        const mockRes = new Res();

        const returnJson = successfulLookupHandler(mockRes, ' 657 331 0806', undefined, mockLookupResult);
        assert.strictEqual(returnJson.phoneNumber, ' 657 331 0806');
        assert.strictEqual(returnJson.countryCode, undefined);
        assert.strictEqual(returnJson.areaCode, undefined);
        assert.strictEqual(returnJson.localPhoneNumber, undefined);
    });
});

describe ('Integration Tests', function() {
    // getPhoneNumber
    it('getPhoneNumber should return valid JSON for a valid complete phone number', () => {
        const mockRes = new Res();
        const mockReq = new Req({phoneNumber:'16573310806'});
        const result = getPhoneNumber(mockReq, mockRes)

        assert.strictEqual(result.phoneNumber, '+16573310806');
        assert.strictEqual(result.countryCode, 'US');
        assert.strictEqual(result.areaCode, '657');
        assert.strictEqual(result.localPhoneNumber, '3310806');
    });

    it('getPhoneNumber should return error response for a valid incomplete phone number', () => {
        const mockRes = new Res();
        const mockReq = new Req({phoneNumber:'6573310806', countryCode:'US'});
        const result = getPhoneNumber(mockReq, mockRes)

        assert.strictEqual(result.phoneNumber, '+16573310806');
        assert.strictEqual(result.countryCode, 'US');
        assert.strictEqual(result.areaCode, '657');
        assert.strictEqual(result.localPhoneNumber, '3310806');
    });

    it('getPhoneNumber should return error response for a invalid incomplete phone number', () => {
        const mockRes = new Res();
        const mockReq = new Req({phoneNumber:'11573310806'});
        const result = getPhoneNumber(mockReq, mockRes)

        assert.strictEqual(result.phoneNumber, '11573310806');
        assert.strictEqual(result.error.countryCode, 'required value is missing');
    });

    it('getPhoneNumber should return error response for a invalid complete phone number', () => {
        const mockRes = new Res();
        const mockReq = new Req({phoneNumber:'1234567890123456'});
        const result = getPhoneNumber(mockReq, mockRes)

        assert.strictEqual(result.phoneNumber, '1234567890123456');
        assert.strictEqual(result.error.phoneNumber, 'invalid input');
    });

    it('getPhoneNumber should return error response for a invalid complete phone number 2', () => {
        const mockRes = new Res();
        const mockReq = new Req({phoneNumber:'1a2b3c4d5e'});
        const result = getPhoneNumber(mockReq, mockRes)

        assert.strictEqual(result.phoneNumber, '1a2b3c4d5e');
        assert.strictEqual(result.error.phoneNumber, 'invalid input');
    });
});