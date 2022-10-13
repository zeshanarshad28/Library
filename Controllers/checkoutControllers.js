const Books = require("../models/booksModel");
const mongoose = require("mongoose");
const SubBooks = require("../models/subBooksModel");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const User = require("../models/userModel");
const IssuedBooks = require("../models/issuedBooks");
const ReservedBooks = require("../models/reserveBooksModel");
const Email = require("../utils/email");
const { json } = require("body-parser");

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
  if (details.reserved == true || details.issued == false) {
    if (details.reserved == true) {
      next(
        new AppErr(
          "This book is already reserved by someone ! Please try another one "
        )
      );
    } else {
      next(
        new AppErr(
          "This book is available to issue ! You cannot reserve it Please issue it . "
        )
      );
    }
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
  const userId = req.params.userId;
  const a = await User.aggregate([
    {
      //   $match: { _id: { $eq: req.params.userId } },
      $match: {
        $expr: {
          $and: [
            {
              $eq: ["$_id", mongoose.Types.ObjectId(userId)],
            },
          ],
        },
      },
    },

    {
      $lookup: {
        from: "issuances",
        localField: "_id",
        foreignField: "userId",
        as: "books",
      },
    },
    {
      $project: {
        v: 0,
        password: 0,
        active: 0,
        blocked: 0,
        member: 0,

        "books.__v": 0,
        "books.userId": 0,
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
  const user = await User.findById(issuanceDetails.userId);
  const alreadyIssuedBooks = user.totalBooksIssued;
  req.user.name = user.name;
  req.user.email = user.email;
  const differenceInDates =
    Date.now().getTime() - issuanceDetails.issuanceExpirationDate.getTime();
  const totalLateDays = (differenceInDates / 1000) * 3600 * 24;
  const totalFine = process.env.FINE_PER_DAY * totalLateDays;
  if (totalLateDays > 0) {
    const assignFine = await User.findByIdAndUpdate(issuanceDetails.userId, {
      fine: user.fine + totalFine,
    });
  }
  //   console.log(`iiiiiiiiiiiiiiii${i}`);
  const updatedUser = await User.findByIdAndUpdate(issuanceDetails.userId, {
    totalBooksIssued: alreadyIssuedBooks - 1,
  });
  //   console.log(updatedUser);
  const a = await SubBooks.findOneAndUpdate(req.params.bookId, {
    issued: false,
  });
  const b = await IssuedBooks.deleteOne({ bookId: req.params.bookId });
  await new Email(user).sendNotification();
  res.status(201).json({
    status: "sucess",
  });
});

// to send late mail
// exports = async function sendLateMail() {
exports.sendLateMail = async (req, res) => {
  try {
    const toMail = await IssuedBooks.aggregate([
      {
        $lookup: {
          from: "users",
          let: { returnDate: "$issuanceExpirationDate", userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $lte: ["$$returnDate", new Date(Date.now())] },
                    {
                      $eq: ["$_id", "$$userId"],
                    },
                  ],
                },
              },
            },
          ],

          as: "UserDetails",
        },
      },
      {
        $unwind: "$UserDetails",
      },
    ]);

    let emails = toMail.map(function (doc) {
      return doc.UserDetails.email;
    });

    console.log(emails);

    const loop = emails.length;
    // console.log(loop);
    for (let a = 0; a < loop; a++) {
      if (toMail[a].notificationMailSent == false) {
        console.log("sending mail");
        let user = { email: emails[a] };
        try {
          await new Email(user).sendIssuanceExpiration();
        } catch (error) {
          console.log(error);
        }

        await IssuedBooks.findByIdAndUpdate(toMail[a]._id, {
          notificationMailSent: true,
        });
        console.log(`mail sent to ${user}`);
      }
    }

    res.status(200).json({
      status: "Success",
      toMail,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      error,
    });
  }
};
