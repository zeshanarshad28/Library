const express = require("express");

const router = express.Router();
const userControllers = require("../Controllers/userControllers");
const authControllers = require("../Controllers/authControllers");
const userMembershipControllers = require("../Controllers/userMembershipControllers");
const fineControllers = require("../Controllers/fineControllers");

// Auth routes
router.post("/signup", authControllers.signup);
router.post("/login", authControllers.login);
router.post("/forgotPassword", authControllers.forgotPassword);
router.patch("/resetPassword/:token", authControllers.resetPassword);

router.patch(
  "/updateMyPassword",
  authControllers.protect,
  authControllers.updatePassword
);

router.patch(
  "/updateMe",
  authControllers.protect,
  userControllers.uploadPhoto,
  userControllers.resizeUserPhoto,
  userControllers.updateMe
);
router.delete("/deleteMe", authControllers.protect, userControllers.deleteMe);
router.get(
  "/getMe",
  authControllers.protect,
  userControllers.getMe,
  userControllers.getUser
);
// block user
router.patch(
  "/blockUser/:userId",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  userControllers.blockUser
);
// unblock user
router.patch(
  "/unblockUser/:userId",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  userControllers.unblockUser
);
// make user member
router.patch(
  "/makeUserMember/:userId",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  userControllers.makeUserMember
);
// Cancel Membership
router.patch(
  "/cancelMembership/:userId",
  authControllers.protect,
  authControllers.restrictTo("admin", "librarian"),
  userControllers.cancelMembership
);
// make user librarian
router.patch(
  "/makeUserLibrarian/:userId",
  authControllers.protect,
  authControllers.restrictTo("admin"),
  userControllers.makeUserLibrarian
);
// buy membership
router.get(
  "/buyMembership",
  authControllers.protect,
  userMembershipControllers.getCheckoutSession
);
// Payment fail
router.patch("/paymentFail", userControllers.paymentFail);
// make me member
router.get("/makeMeMember/:id", userControllers.makeMeMember);

router.use(authControllers.protect);
router.use(authControllers.restrictTo("admin")); // This midlware will only allow admin to use below all routes.
router.get("/getAllUsers", userControllers.getAllUsers);
// buy membership
router.get(
  "/payFine",
  authControllers.protect,
  authControllers.protect,
  fineControllers.payFine
);

module.exports = router;
