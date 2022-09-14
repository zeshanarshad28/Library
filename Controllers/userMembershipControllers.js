// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripe = require("stripe")(
  "sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2"
);

const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlersFactory = require("./handlersFactory");
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  console.log("In checkout session");

  // get the user to make member
  const userToBeMember = await User.findOne(req.user);
  //   console.log(userToBeMember);

  //  2) creat checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // these five lines are information about session itself
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/makeMeMember/${userToBeMember.id}`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/user/paymentFail`,
    customer_email: userToBeMember.email,
    client_reference_id: userToBeMember.id,
    line_items: [
      // this is the information about product which user is going to purchase
      {
        price_data: {
          currency: "usd",
          unit_amount: 500,
          product_data: {
            name: `Membership`,
            description: "Membership for library ",
            // images: null,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  console.log(session);
  //   3) creat a seesion as a response
  res.status(200).json({
    status: "success",
    session,
  });
});
