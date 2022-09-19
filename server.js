const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cron = require("node-cron");
const app = require("./app");
const IssuedBooks=require("./Models/issuedBooks")
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3500;
const server = app.listen(port, () => {
  console.log(
    `App is running in "${process.env.NODE_ENV}" environment on port "${port}"`
  );
});

// - to send mails to users who donot return books on time .
// const job = cron.schedule(" * 8 * * *", async () => {

const job = cron.schedule("*/10 * * * * *", async () => {
  console.log(" cronnnnnn");
  try {
    const toMailAndFine=await 
    
  } catch (error) {
    
  }
});
