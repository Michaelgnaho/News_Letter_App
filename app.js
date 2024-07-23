const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Ensure JSON parsing is enabled

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/subscribe", function (req, res) {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;

  // Debug log to check incoming form data
  console.log("Received form data:", { firstName, lastName, email });

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const options = {
    url: `https://us22.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY}`,
    },
    body: jsonData,
  };

  request(options, function (error, response, body) {
    if (error) {
      console.error("Request error:", error);
      res.json({ success: false, message: "Internal Server Error" });
    } else {
      const responseBody = JSON.parse(body);
      if (response.statusCode === 200) {
        res.json({
          success: true,
          message: "You have been subscribed! Thank You",
        });
      } else {
        console.error("Response error:", responseBody);
        res.json({
          success: false,
          message: responseBody.detail || "Subscription failed",
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
