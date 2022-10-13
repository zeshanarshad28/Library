const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const port = 3400;
const server = app.listen(port, () => {
  console.log(
    `App is running in "${process.env.NODE_ENV}" environment on port "${port}"`
  );
});
app.get("/", (req, res) => {
  sendTextMessage();
  console.log("GGGGGGGG");
  res.status(200).send(`Message sent`);
});
function sendTextMessage() {
  client.messages
    .create({
      body: "its ok",
      from: "+17572804619",
      to: "+923056320218",
    })
    .then((message) => console.log(message.sid))
    .catch((error) => console.log(error));
}
