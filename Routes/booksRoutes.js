const express = require("express");

const router = express.Router();
const userControllers = require("../Controllers/userControllers");
const authControllers = require("../Controllers/authControllers");
const booksControllers = require("../Controllers/booksControllers");
router.post(
  "/addnewBook",
  booksControllers.uploadPhoto,
  booksControllers.resizeBookPhoto,
  booksControllers.addNewBook
);
router.post(
  "/addnewsubBook",
  booksControllers.uploadPhoto,
  booksControllers.resizeBookPhoto,
  booksControllers.addNewsubBook
);

module.exports = router;
