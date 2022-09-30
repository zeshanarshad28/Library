const express = require("express");

const router = express.Router();
const userControllers = require("../Controllers/userControllers");
const authControllers = require("../Controllers/authControllers");
const booksControllers = require("../Controllers/booksControllers");
const checkoutControllers = require("../Controllers/checkoutControllers");
const fineControllers = require("../Controllers/fineControllers");

//  issue a book
router.post(
  "/checkoutBook/:bookId",
  authControllers.protect,
  authControllers.restrictTo("member"),
  checkoutControllers.checkoutBook
);
//  Reserve a book
router.post(
  "/reserveBook/:bookId",
  authControllers.protect,
  authControllers.restrictTo("member"),
  checkoutControllers.reserveBook
);
//  Get user who took specific book
router.get(
  "/userWhoTookBook/:bookId",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  checkoutControllers.userWhoTookBook
);
// All books issued by specific user
router.get(
  "/allBooksTakenByMember/:userId",
  authControllers.protect,
  authControllers.restrictTo("member", "librarian", "admin"),
  checkoutControllers.allBooksTakenByMember
);
// Return a book
router.patch(
  "/returnBook/:bookId",
  authControllers.protect,
  authControllers.restrictTo("member", "librarian"),
  checkoutControllers.returnBook
);
// Update Fine
router.patch("/updateFine", fineControllers.payFine);
// Pay fine
router.get("/payFine", authControllers.protect, fineControllers.payFine);

// // Send mail on issuance expiration come
// router.patch(
//   "/sendLateMail",

//   checkoutControllers.sendLateMail
// );
module.exports = router;
