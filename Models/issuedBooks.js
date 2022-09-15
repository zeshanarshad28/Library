const mongoose = require("mongoose");

const issuedBooksSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.ObjectId,
    ref: "SubBooks",
    // required: [true, "please give "],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    // required: [true, "Booking must belong to a User!"],
  },
  issuanceDate: {
    type: Date,
    dafault: Date.now(),
  },
  issuanceExpirationDate: {
    type: Date,
    default: () => Date.now() + 10 * 24 * 60 * 60 * 1000,
  },
});

issuedBooksSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "book",
    select: "title",
  });
  next();
});

const Issuance = mongoose.model("Issuance", issuedBooksSchema);

module.exports = Issuance;
