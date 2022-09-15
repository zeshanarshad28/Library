const User = require("../models/userModel");
const multer = require("multer");
const sharp = require("sharp");
const AppErr = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const handlersFactory = require("./handlersFactory");
const { promisify } = require("util");
const { trusted } = require("mongoose");
const { findById } = require("../models/userModel");
const { Console } = require("console");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// :::::::::::::: MULTER :::::::::::::::::::::::

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
// uploading the image
exports.uploadPhoto = upload.single("photo");
// Re-size user photos
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log(`req.file is: ${req.file}`);
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  //   console.log(`Resize is working and file name is: ${req.file.filename}`);
  //   console.log(req.file);
  //   console.log(req.file.buffer);
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/user/${req.file.filename}.jpeg`);
  next();
});
// Get Me Middlware
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  console.log("getMe working");
  next();
};
// Getting  user by id
exports.getUser = handlersFactory.getOne(User);
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ======  API for updating already loged in user====================
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppErr("This route is not for update password", 400));
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, "name", "email");
  // updating the photo name in db
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
  // console.log(`filename::${req.file.filename}`)
  // console.log(req.user.id);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  console.log(filteredBody);
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

//  get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await User.aggregate([
    {
      $match: {},
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      allUsers,
    },
  });
});

// Deleting the users====================
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

//  Blocking user
exports.blockUser = catchAsync(async (req, res, next) => {
  const userToUpdate = await User.findById(req.params.userId);
  console.log(`user to update is:${userToUpdate.role}`);
  console.log(`user who is updating is:${req.user.role}`);

  if (
    userToUpdate.role == "admin" ||
    (userToUpdate.role == "librarian" && req.user.role == "librarian")
  ) {
    console.log("condition pass");
    next(new AppErr("You cannot perform this operation!", 400));
  }
  await User.findByIdAndUpdate(req.params.userId, { blocked: true });
  res.status(200).json({
    status: "success",
    data: null,
  });
});

//  Unblocking user
exports.unblockUser = catchAsync(async (req, res, next) => {
  const userToUpdate = User.findById(req.params.userId);
  if (userToUpdate == "librarian" && req.user.role == "librarian") {
    next(new AppErr("You cannot perform this operation!", 400));
  }
  await User.findByIdAndUpdate(req.params.userId, { blocked: false });
  res.status(200).json({
    status: "success",
    data: null,
  });
});

// make user member
exports.makeUserMember = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.userId, {
    member: true,
    role: "member",
  });
  res.status(200).json({
    status: "success",
    data: null,
  });
}); // Cancel membership
exports.cancelMembership = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.userId, {
    member: false,
    role: "user",
  });
  res.status(200).json({
    status: "success",
    data: null,
  });
});

// make user Librarian
exports.makeUserLibrarian = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.userId, { role: "librarian" });
  res.status(200).json({
    status: "success",
    data: null,
  });
});

// Payment fail
exports.paymentFail = catchAsync(async (req, res, next) => {
  Console.log("payment is not paid . there is something went wrong");
  res.status(200).json({
    status: "fail",
  });
});
// run when payment paid
exports.makeMeMember = catchAsync(async (req, res, next) => {
  console.log("payment is  paid ! ");
  await User.findByIdAndUpdate(req.params.id, { member: true, role: "member" });
  res.status(200).json({
    status: "fail",
  });
});
