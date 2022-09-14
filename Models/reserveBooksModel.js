const mongoose = require("mongoose");

const reserveBooksSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: "SubBooks",
    required: [true, "Booking must belong to a Tour!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User!"],
  },

  reserveDate: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("User").populate({
    path: "SubBooks",
  });
  next();
});

const ReserveBooks = mongoose.model("ReserveBooks", reserveBooksSchema);

module.exports = ReserveBooks;
