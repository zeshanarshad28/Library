const mongoose = require("mongoose");
const validator = require("validator");
const SubBooks = require("./subBooksModel");
const booksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, "Please enter name"],
      unique: true,
      trim: true,
    },
    auther: {
      type: String,
      require: [true, "Please enter name"],
      trim: true,
    },
    ISBN: {
      type: Number,
      default: Math.floor(Math.random() * 1000000000000 + 9999999999999),
      unique: true,
      //   require: [true, "Please enter ISBN "],
    },
    category: {
      type: String,
      require: [true, "Please enter/select category"],
      trim: true,
    },

    available: {
      type: Boolean,
    },
    totalBooks: {
      type: Number,
      require: [true, "Please enter number of books (total books)"],
    },

    rackNumber: {
      type: String,
      require: [
        true,
        "Please enter the rack number in which this book will kept",
      ],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate to include all sub books of specific book
booksSchema.virtual("Sub_Books", {
  ref: "SubBooks", // refernce schema name
  foreignField: "bookDetails",
  localField: "_id",
});

// booksSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "bookDetails",
//     select: "-__v -createdAt -updatedAt", // excluding some fields
//   });
//   next();
// });
const Books = mongoose.model("Books", booksSchema);
module.exports = Books;
