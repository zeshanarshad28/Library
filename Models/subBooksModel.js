const mongoose = require("mongoose");
const Books = require("./booksModel");
const subBooksSchema = new mongoose.Schema(
  {
    bookId: {
      type: Number,
      unique: true,
    },
    bookDetails: {
      type: mongoose.Schema.ObjectId,
      ref: "Books",
    },

    coverImage: {
      type: String,
      default: "default.jpg",
    },
    additionNumber: {
      type: Number,
    },
    publicationDate: {
      type: Date,
      required: [true, "Please enter publication date of this book"],
    },
    reserved: {
      type: Boolean,
      default: false,
    },
    issued: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// subBooksSchema.pre("save", async function (next) {
//   console.log("in pre save ...");

//   this.bookDetails = await Books.findById(this.bookDetails);

//   // console.log(this.bookDetails);
//   next();
// });
subBooksSchema.pre(/^find/, function (next) {
  this.populate({
    path: "bookDetails",
    select: "-__v -createdAt -updatedAt", // excluding some fields
  });
  next();
});
const SubBooks = mongoose.model("SubBooks", subBooksSchema);
module.exports = SubBooks;
