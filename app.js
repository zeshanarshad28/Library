const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

const userRoutes = require("./routes/userRoutes");
const booksRoutes = require("./routes/booksRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorControllers");

const app = express();

// ===== Data sanitization against NoSQL query injection
// app.use(mongoSanitize());
// // ======== Data sanitization against XSS (protection from malicious html) use pkg name exactly "xss-clean"
// app.use(xssClean());
// //  Set Security HTTP Headers======
// app.use(helmet());

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(express.json());
// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/checkouts", checkoutRoutes);

// // Handling unhandled routes:
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Error handler middlware
app.use(globalErrorHandler);

module.exports = app;
