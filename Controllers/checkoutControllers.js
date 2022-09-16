const Books = require("../models/booksModel");
const SubBooks = require("../models/subBooksModel");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const User = require("../models/userModel");
const IssuedBooks = require("../models/issuedBooks");
const ReservedBooks = require("../models/reserveBooksModel");

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
  if (details.reserved == true) {
    reserveInfo = await ReservedBooks.findOne({ bookId: req.params.bookId });
    if (!req.user.id == reserveInfo.userId) {
      next(
        new AppErr(
          "This book is already reserved by someone else you cannot issue it for now  "
        )
      );
    }
  }
  const userInfo = await User.findById(req.user.id);
  const i = userInfo.totalBooksIssued;
  if (i > 4)
    next(new AppErr("You already issued 5 books . Return first to get new   "));
  await User.findByIdAndUpdate(req.user.id, {
    totalBooksIssued: i + 1,
  });
  const newCheckout = await IssuedBooks.create({
    bookId: req.params.bookId,
    userId: req.user.id,
    issuanceDate: Date.now(),
  });
  const a = await SubBooks.findOneAndUpdate(
    { _id: req.params.bookId },
    {
      reserved: false,
      issued: true,
    }
  );
  const b = await ReservedBooks.deleteOne({ bookId: req.params.bookId });
  res.status(201).json({
    status: "sucess",
    newCheckout,
  });
});
//  Reserve a book
exports.reserveBook = catchAsync(async (req, res, next) => {
  console.log("In reserve  ");
  const details = await SubBooks.findOne({ _id: req.params.bookId });
  console.log(`Book is:::::::::: ${details}`);
  if (details.reserved == true) {
    next(
      new AppErr(
        "This book is already reserved by someone ! Please try another one "
      )
    );
  }
  const newReserved = await ReservedBooks.create({
    bookId: req.params.bookId,
    userId: req.user.id,
  });
  const a = await SubBooks.findOneAndUpdate(
    { _id: req.params.bookId },
    {
      reserved: true,
    }
  );
  res.status(201).json({
    status: "sucess",
    newReserved,
  });
});

//  Get user Who took specific Book
exports.userWhoTookBook = catchAsync(async (req, res, next) => {
  const { userId } = await IssuedBooks.findOne({ bookId: req.params.bookId });
  //   console.log(userId);
  const user = await User.findById(userId);
  res.status(201).json({
    status: "sucess",
    user,
  });
});

// All books taken by a specific member
exports.allBooksTakenByMember = catchAsync(async (req, res, next) => {
  //   req.query = req.params.userId;
  console.log(req.params.userId);
  const a = await User.aggregate([
    {
      //   $match: { _id: { $eq: req.params.userId } },
      $match: {},
    },
    {
      $lookup: {
        from: "issuances",
        localField: "_id",
        foreignField: "userId",
        as: "books",
      },
    },
  ]);
  console.log(a);
  // const user = await User.findById(userId);
  res.status(201).json({
    status: "sucess",
    a,
  });
});

//  Return a Book
exports.returnBook = catchAsync(async (req, res, next) => {
  console.log("In return  ");

  const issuanceDetails = await IssuedBooks.findOne({
    bookId: req.params.bookId,
  });
  const userInfo = await User.findById(issuanceDetails.userId);
  const i = userInfo.totalBooksIssued;
  //   console.log(`iiiiiiiiiiiiiiii${i}`);
  const updatedUser = await User.findByIdAndUpdate(issuanceDetails.userId, {
    totalBooksIssued: i - 1,
  });
  //   console.log(updatedUser);
  const a = await SubBooks.findOneAndUpdate(req.params.bookId, {
    issued: false,
  });
  const b = await IssuedBooks.deleteOne({ bookId: req.params.bookId });
  res.status(201).json({
    status: "sucess",
  });
});
