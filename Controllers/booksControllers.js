const Books = require("../models/booksModel");
const SubBooks = require("../models/subBooksModel");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
const ApiFeatures = require("../Utils/apiFeatures");
const multer = require("multer");
const sharp = require("sharp");
const { findById } = require("../models/userModel");
const { findByIdAndUpdate } = require("../models/booksModel");
// add new book ( main +  its sub books)
exports.addNewBook = catchAsync(async (req, res, next) => {
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
// add sub book
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
// update main Book
exports.updateBook = catchAsync(async (req, res, next) => {
  const updatedBook = await Books.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    updatedBook,
  });
});
// update Sub Book
exports.updateSubBook = catchAsync(async (req, res, next) => {
  const updatedBook = await SubBooks.findByIdAndUpdate(
    req.params.id,
    {
      publicationDate: req.body.publicationDate,
      coverImage: req.body.coverImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({
    status: "success",
    updatedBook,
  });
});

// delete book
exports.deleteBook = catchAsync(async (req, res, next) => {
  // first delete all sub books belongs to it
  const a = await SubBooks.deleteMany({ bookDetails: req.params.id });
  console.log(a);
  const doc = await Books.findOneAndDelete({ _id: req.params.id });
  if (!doc) {
    return next(new AppErr("No document find with that Id", 404));
  }

  res.status(204).json({
    status: "Sucess",
    data: null,
  });
});
// delete Sub Book
exports.deleteSubBook = handlersFactory.deleteOne(SubBooks);
//  Get main book
exports.getBook = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Books.find(), req.query)
    .filter()
    .limitFields()
    .paginate();

  // const doc = await features.query.explain(); // here explain method is just to check indexing
  const doc = await features.query;
  res.json({
    status: "Success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

// Get Sub-Book
exports.getSubBook = handlersFactory.getAll(SubBooks);

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

  req.body.coverImage = `book-${req.user.id}-${Date.now()}-cover.jpeg`;
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
    await Books.deleteMany();

    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// const a = deleteData();
