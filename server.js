const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cron = require("node-cron");
const app = require("./app");
const checkoutControllers = require("./Controllers/checkoutControllers");

const Email = require("./Utils/email");
// const User = require("./Models/userModel");
// const Issuance = require("./Models/issuedBooks");
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

// const task = cron.schedule("*/10 * * * * *", async () => {
//   console.log("checking");
//   // checkoutControllers.sendLateMail();
//   const toMail = await Issuance.aggregate([
//     {
//       $lookup: {
//         from: "users",
//         let: { returnDate: "$issuanceExpirationDate", userId: "$userId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $lte: ["$$returnDate", new Date(Date.now())] },
//                   {
//                     $eq: ["$_id", "$$userId"],
//                   },
//                 ],
//               },
//             },
//           },
//         ],

//         as: "UserDetails",
//       },
//     },
//     {
//       $unwind: "$UserDetails",
//     },
//   ]);

//   let emails = toMail.map(function (doc) {
//     return doc.UserDetails.email;
//   });

//   console.log(emails);

//   const loop = emails.length;
//   // console.log(loop);
//   for (let a = 0; a < loop; a++) {
//     if (toMail[a].notificationMailSent == false) {
//       console.log("sending mail");
//       let user = { email: emails[a] };
//       await new Email(user).sendIssuanceExpiration();
//       await Issuance.findByIdAndUpdate(toMail[a]._id, {
//         notificationMailSent: true,
//       });
//       console.log(`mail sent to ${user}`);
//     }
//   }

//   res.status(200).json({
//     status: "Success",
//     toMail,
//   });
// });
// .catch((error) => {
//   console.log(error);
//   res.status(400).json({
//     status: "fail",
//     error,
//   });
// });
// });
