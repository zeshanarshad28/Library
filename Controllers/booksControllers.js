const Books = require("../models/booksModel");
const SubBooks = require("../models/subBooksModel");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const multer = require("multer");
const sharp = require("sharp");

exports.addNewBook = catchAsync(async (req, res, next) => {
  //   deleteData();
  const newBook = await Books.create(req.body);
  const n = req.body.totalBooks;
  const bookDetails = newBook._id;
  //   console.log(n);
  console.log(`ID of main book${bookDetails}`);
  for (let i = 1; i <= n; i++) {
    const subBook = await SubBooks.create({
      bookDetails,
      bookId: Math.floor(Math.random() * 1000 + 9999),
      coverImage: req.body.coverImage,
      publicationDate: req.body.publicationDate,
    });
    console.log(subBook);
  }
  res.status(201).json({
    status: "success",
    newBook,
  });
});
exports.addNewsubBook = catchAsync(async (req, res, next) => {
  const mainBook = await Books.findOne(req.query);
  console.log(`main book: ${mainBook}`);
  const id = mainBook._id;
  const subBook = await SubBooks.create({
    bookDetails: id,
    bookId: Math.floor(Math.random() * 1000 + 9999),
    publicationDate: req.body.publicationDate,
    coverImage: req.body.coverImage,
  });
  //   console.log(subBook);

  res.status(201).json({
    status: "success",
    subBook,
  });
});
// ===============================================
// Image upload options using multer

// multer storage to store image in memory( as a buffer)
const multerStorage = multer.memoryStorage();

// multer filter to check if the uploaded file is an image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppErr("not and image! please upload an image file.", 400));
  }
};
// configuring the multer.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// // uploading the multiple images
exports.uploadPhoto = upload.single("coverImage");
// Re-size user photos
exports.resizeBookPhoto = catchAsync(async (req, res, next) => {
  console.log("resize is working");
  if (!req.file) return next();

  req.body.coverImage = `user-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/books/${req.body.coverImage}`);
  next();
});
// delete whole collection
const deleteData = async () => {
  try {
    await SubBooks.deleteMany();

    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
