// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripe = require("stripe")(
  "sk_test_51LfeSFFPcxiOmlyFYfcrY9JsYZc17Xf0QtXyBlwR5ysean3uv4DrpmiOfRcpWShanIbnLcusRNTd9RvdV7MiMUY100PlL258F2"
);

const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlersFactory = require("./handlersFactory");

exports.payFine = catchAsync(async (req, res, next) => {
  console.log("In checkout session");

  // get the user who will pay fine
  const finePayBy = await User.findOne(req.user);
  const fine = finePayBy.fine;
  console.log(`fine:::::${fine}`);
  //   console.log(userToBeMember);

  //  2) creat checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // these five lines are information about session itself
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/api/v1/checkouts/updateFine`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/user/paymentFail`,
    customer_email: finePayBy.email,
    client_reference_id: finePayBy.id,
    line_items: [
      // this is the information about product which user is going to purchase
      {
        price_data: {
          currency: "usd",
          unit_amount: 6000,
          //   unit_amount: 1000,

          product_data: {
            name: `Fine`,
            description: "Library Fine ",
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

exports.updateFine = async (req, res) => {
  try {
    console.log("in pay fine");
    const a = await User.findByIdAndUpdate(req.user.id, {
      fine: 0,
    });

    res.status(201).json({
      status: "success",
      a,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
    });
  }
};
