const express = require("express");

const router = express.Router();
const userControllers = require("../Controllers/userControllers");
const authControllers = require("../Controllers/authControllers");
const booksControllers = require("../Controllers/booksControllers");
// Add new book ( Main book) + sub books
router.post(
  "/addnewBook",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  booksControllers.uploadPhoto,
  booksControllers.resizeBookPhoto,
  booksControllers.addNewBook
);
// Add sub-Book
router.post(
  "/addnewsubBook",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  booksControllers.uploadPhoto,
  booksControllers.resizeBookPhoto,
  booksControllers.addNewsubBook
);
// Update Book
router.patch(
  "/updateBook/:id",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  booksControllers.updateBook
);
// Update Sub-Book
router.patch(
  "/updateSubBook/:id",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  booksControllers.uploadPhoto,
  booksControllers.resizeBookPhoto,
  booksControllers.updateSubBook
);
// Delete Book
router.delete(
  "/deleteBook/:id",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  booksControllers.deleteBook
);
// Delete Sub-Book
router.delete(
  "/deleteSubBook/:id",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  booksControllers.deleteSubBook
);
// Get Book
router.get("/getBook", booksControllers.getBook);
// Get Sub-Book
router.get("/getSubBook", booksControllers.getSubBook);
module.exports = router;
