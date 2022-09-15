const express = require("express");

const router = express.Router();
const userControllers = require("../Controllers/userControllers");
const authControllers = require("../Controllers/authControllers");
const booksControllers = require("../Controllers/booksControllers");
const checkoutControllers = require("../Controllers/checkoutControllers");

//  issue a book
router.post(
  "/checkoutBook/:bookId",
  authControllers.protect,
  authControllers.restrictTo("member"),
  checkoutControllers.checkoutBook
);

module.exports = router;
