const express = require("express");
const { getPhoneNumber } = require("./phone-number");
const app = express();
const hostname = '127.0.0.1';
const port = 3000;

app.set('json spaces', 2) // enables pretty printing of JSON

// Redirect root URL to /v1/phone-numbers
app.get('/', (req, res) => {
  res.redirect('/v1/phone-numbers');
});

app.get("/v1/phone-numbers", getPhoneNumber)

app.listen(port, hostname, () => {
  console.log(`Phone Number Lookup API running at http://${hostname}:${port}/v1/phone-numbers`);
  console.log("\n\n");

  console.log("Here's an example API request to get you started: http://127.0.0.1:3000/v1/phone-numbers?phoneNumber=16573310806");
});


