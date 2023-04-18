
  

# Phone Number Lookup API

## Overview

This API listens for GET requests at http://127.0.0.1:3000/v1/phone-numbers and provides information on a phone number.

  

## Setup
### Installation and Running
1. Install Node.js: 
	- Download link can be found [here](https://nodejs.org/en/download)
	- Alternatively you can use a package manager listed [here](https://nodejs.dev/en/download/package-manager/)
		- eg. `brew install node`
2. Clone the Github repository:

```
git clone https://github.com/kevinzhu822/PhoneNumberLookup
```

3. Navigate into the repository folder

```
cd PhoneNumberLookup
```

4. Start the server

```
npm start
```

If you see the message `Phone Number Lookup API running at http://127.0.0.1:3000/v1/phone-numbers` displayed, the server is running!


### Testing
To run the included test suite, run the following command:
```
npm test
```
  

## Parameters

### Request Parameters

#### phoneNumber
- String in E.164 format that represents a phone number. It consists of the following parts:
  -  **+** (optional)
  -  **country code** (optional): a sequence of digits that identifies the country.
  -   **area code**: a sequence of digits that identifies the region within a country.
  -    **local phone number**: a sequence of digits that identifies a specific phone number within a region.

  

- Spaces between country, area code, and local phone number are allowed, but any other spaces or characters are invalid. If the phone number is missing a country code, the user must provide the `countryCode` parameter in ISO 3166-1 alpha-2 format.

  

- Valid examples of phone numbers include:
  -  `+12125690123`
  -  `+52 631 3118150`
  - `34 915 872200`

  

#### countryCode 
- String in ISO 3166-1 alpha-2 format that represents the country code. Valid examples of country codes include:
  -   `US`
  -   `MX`

  

### Response

Upon successful request, the API returns a JSON object containing the following fields:

  

-  `phoneNumber`: the input phone number in E.164 format.

-  `countryCode`: the ISO 3166-1 alpha-2 format country code.

-  `areaCode`: the phone number's area code.

-  `localPhoneNumber`: the phone number's local phone number.

**Example**:
Request: `/v1/phone-numbers?phoneNumber=16573310806`
Response:
```json
{
  "phoneNumber": "+16573310806",
  "countryCode": "US",
  "areaCode": "657",
  "localPhoneNumber": "3310806"
}
```

### Errors

If an error occurs, the API will return an error object with one of two possible structures:

#### Missing Input Error

If a required parameter is missing, the error response will include an `error` object with a key-value pair that indicates which parameter is missing. 

**Example**:
Request: `/v1/phone-numbers?phoneNumber=6573310806`
Response:
```json

{
  "phoneNumber": "6573310806",
  "error": {
    "countryCode": "required value is missing"
  }
}

```

### Invalid Value Error

If a parameter is present but invalid, the error response will include an `error` object with a key-value pair that indicates which parameter is invalid. 

**Example**:
Request: `/v1/phone-numbers?phoneNumber=abcdefghijkl`
Response:
```json

{
  "phoneNumber": "abcdefghijkl",
  "error": {
    "phoneNumber": "invalid input"
  }
}
```
**Note**: *If a fully-qualified E.164  `phoneNumber`  is provided but an incorrect `countryCode` is also provided, an Invalid Country Code error will be returned.*

Example:
- Request: `/v1/phone-numbers?phoneNumber=16573310806&countryCode=CN` 
	- `16573310806` is a valid US phone number
- Response: 
```json

{
  "phoneNumber": "16573310806",
  "countryCode": "CN",
  "error": {
    "countryCode": "invalid input"
  }
}
```

  
In all cases, the `phoneNumber` field (and `countryCode` if provided) will be included in the response object with the original input value provided by the user.
  
  
  

## Q & A

  

### Explanation of your choice of programming language, framework, library.

For the server, I chose **Node.js (Javascript)** with the **Express** server framework because it's a lightweight solution that allows for fast development and deployment of web servers. Additionally, I'm already familiar with Javascript, this choice made the development process more efficient. As for scaling, Node.js has built-in support for concurrency, and its event-driven architecture allows it to handle a large number of connections without blocking other requests. This makes it easy to scale and handle high traffic loads if this API was ever released to production.

  

The **awesome-phonenumber** library was chosen as a datasource because it is based on Google's libphonenumber library, which is known for its accuracy and reliability. Additionally, it supports queries without providing an alphanumeric country code, which is a frequent use case for this API.

  

**Mocha** was chosen as the testing framework because it provides a clean and easy-to-understand syntax for writing tests. It also integrates well with other testing libraries and tools, which made it easy to add to the development process. In addition, Mocha provides good documentation and community support.

  

### Explanation of how you would deploy to production.

  

To deploy this API to production, I would leverage **AWS' Elastic Beanstalk** service because it supports direct upload of Node.js source code, which makes it easy to deploy my Node.js server. Additionally, it can handle the underlying infrastructure, scaling, and deployment processes automatically, which frees me up to focus on developing new features for my application. Elastic Beanstalk also supports custom configurations, allowing me to specify things like environment variables, load balancer settings, and database connections.

  

However, one drawback of Elastic Beanstalk is that it abstracts away some of the underlying infrastructure, which can limit my ability to fine-tune certain aspects of the deployment. If I needed more control over the infrastructure or wanted to optimize for specific use cases, I might consider directly using **EC2 instances**. With EC2 instances, I would create a new instance from a pre-configured Amazon Machine Image (AMI) with Node.js installed, and then configure the instance with my app's source code and any necessary dependencies. I would also need to configure things like security groups, load balancing, and auto-scaling based on my app's usage patterns.

  

### Explanation of assumptions you made

-  **The `awesome-phonenumber` library will always provide correct responses and should be trusted over user-provided input.** For example, if the countryCode provided by the user and the countryCode returned by awesome-phonenumber do not match, the API should trust the library and return an error. Additionally, if any changes are made to the I.164 standard or new area/country codes are created, I assume `awesome-phonenumber` will be updated by its maintainers to reflect the changes.

-  **Optional or unnecessary parameters in the query string should be ignored if they are not required.** For instance, if a phoneNumber is provided with a valid country code, but an additional countCode parameter is provided, the API would ignore the countCode parameter and handle the phoneNumber as normal.

-  **No phone number exists that is a valid I.164 phone number and still valid when a country code is prepended to it.** This is important because `phoneNumber` is first checked with the `awesome-phonenumber` library, and if the query fails, `countryCode` is prepended to the `phoneNumber` and is checked again. In the case where `phoneNumber` is a valid I.164 phone number, but the `countryCode+phoneNumber` is also a valid I.164 phone number , there is a discrepancy that needs to be handled. However, from my (admittedly-shallow) understanding of I.164 phone numbers, this is not possible.

-  **I assume that a countryCode prepended to an invalid phoneNumber could potentially result in a valid phoneNumber**. This is the rationale behind the "Missing Input Error" response type, where a `phoneNumber` is identified as invalid but a `countryCode` was not provided. This is because if a `countryCode` were provided, there is a possibility that the `phoneNumber` could have become valid. For example, if the `phoneNumber` "6573310806" were provided without a `countryCode`, it would be considered invalid. However, if the `countryCode`  `"US"` were provided, we would prepend `+1` to `phoneNumber`, transforming it into a valid I.164 phone number.

  

### Explanation of improvements you wish to make

**Improvement 1: Add Features and Supported Phone Number Types**

Returning additional information about the phone number such as its specific geographic region (ex. 415 area code -> California) and supporting special 3-digit numbers like 911 and 511 would definitely enhance the usefulness and versatility of the API. These additional features could provide valuable information to users and make the API more useful.

  

**Improvement 2: Add Concurrency Support**

Adding concurrency to the API would be a major improvement, especially given that Node.js is designed for high-performance and non-blocking I/O. By implementing a concurrent design, multiple requests could be handled simultaneously, improving the overall speed and efficiency of the API. This would be especially important for maintaining availability despite high-traffic.

  

**Improvement 3: Improve Space Validation**

The current implementation checks for spaces (" ") and their placement after the phone number has already been queried via `awesome-phonenumber`which is not very efficient. However, the query is currently required because the API is unable to determine if the spaces are only located between countryCode, areaCode, and localNumber without knowing the values of those fields.

  

A more optimal solution would be to determine if the spaces are correctly placed and returning an error without querying the library at all. However, this would require an in-depth understanding of I.164 phone numbers, or may not be possible at all.

  

**Improvement 4: Add `node_modules` to .gitignore**

Since this API will not actually be deployed to production servers, I chose to include the `node_modules` folder in my repository to improve the setup experience for testers. However, for a real production application, I would add `node_modules` to the .gitignore file, to ensure it is not uploaded along with the source code.

  

This is because including the `node_modules` folder in the source code that is uploaded to a cloud provider (such as AWS) can significantly increase the size of the deployment package. This can negatively impact server cold starts, which occur when a new instance is spun up to handle incoming requests and has to download and install all dependencies before it can start serving traffic. The larger the deployment package, the longer it takes for the instance to become available, resulting in longer cold start times.

  

To avoid this issue, I would include `node_modules` in the `.gitignore` file and let AWS handle the installation of dependencies during deployment. AWS provides different methods for handling dependencies, such as using an `npm install` command during deployment. By using that technique, AWS can cache dependencies across deployments and help us reduce cold start times for this API.
