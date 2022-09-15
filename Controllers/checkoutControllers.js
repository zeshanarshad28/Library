const Books = require("../models/booksModel");
const SubBooks = require("../models/subBooksModel");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const User = require("../models/userModel");
const IssuedBooks = require("../models/issuedBooks");

exports.checkoutBook = catchAsync(async (req, res, next) => {
  console.log("in checkout ");
  const details = await SubBooks.findOne({ _id: req.params.bookId });
  console.log(`Book is:::::::::: ${details}`);
  if (details.issued == true) {
    next(
      new AppErr(
        "This book is already issued to someone you can just reserve it for now "
      )
    );
  }
  const newCheckout = await IssuedBooks.create({
    bookId: req.params.bookId,
    userId: req.user.id,
    issuanceDate: req.body.issuanceDate,
  });
  const a = await SubBooks.findOneAndUpdate(
    { _id: req.params.bookId },
    {
      issued: true,
    }
  );
  res.status(201).json({
    status: "sucess",
    newCheckout,
  });
});
