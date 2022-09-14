const mongoose = require("mongoose");

const bookIssuanceSchema = new mongoose.Schema({
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
  issuanceDate: {
    type: Date,
    dafault: Date.now(),
  },
  issuanceExpirationDate: {
    type: Date,
    default: this.issuanceDate.setDate(this.issuanceDate.getDate() + 10),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "book",
    select: "title",
  });
  next();
});

const Issuance = mongoose.model("Issuance", bookIssuanceSchema);

module.exports = Issuance;
