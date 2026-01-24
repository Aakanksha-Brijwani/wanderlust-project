// if (process.env.NODE_ENV != "production") {
//   require("dotenv").config();
// }
// const sessionSecret = process.env.SECRET || "mysupersecretcode";

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");

// //const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
// //console.log("DB URL:", dbUrl);
// //console.log("ATLASDB_URL =", process.env.ATLASDB_URL);

// async function main() {
//   try {
//     await mongoose.connect(dbUrl, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("connected to DB");
//   } catch (err) {
//     console.log("DB CONNECTION ERROR:", err);
//   }
// }

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// async function main() {
//   await mongoose.connect(dbUrl);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.engine("ejs", ejsMate);
// app.use(express.static(path.join(__dirname, "/public")));

// const store = MongoStore.create({
//   mongoUrl: process.env.ATLASDB_URL,
//   crypto: {
//     secret: sessionSecret,
//   },
//   touchAfter: 24 * 3600,
// });

// store.on("error", (err) => {
//   console.log("ERROR in MONGO SESSION STORE", err);
// });

// const sessionOptions = {
//   store,
//   secret: sessionSecret,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//   },
// };

// // app.get("/", (req, res) => {
// //   res.send("Hi, I am root");
// // });

// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currUser = req.user;

//   next();
// });

// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);
// app.use("/", userRouter);

// // app.get("/demouser",async(req,res)=>{
// //   let fakeUser = new User({
// //     email: "student@gmail.com",
// //     username: "delta-student"
// //   });

// //   let registerdUser = await User.register(fakeUser,"Helloworld");
// //   return res.json(registerdUser);
// // });

// app.use((req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

// app.use((err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);
//   }

//   let { statusCode = 500, message = "Something went wrong!" } = err;
//   res.status(statusCode).render("error.ejs", { message });
// });

// app.listen(8080, () => {
//   console.log("server is listning to port 8080");
// });

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ======================
// DATABASE CONFIG
// ======================
const sessionSecret = process.env.SECRET || "mysupersecretcode";
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

console.log("Connecting to MongoDB");

async function main() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}

main();

// ======================
// APP CONFIG
// ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================
// SESSION STORE
// ======================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("SESSION STORE ERROR:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ======================
// PASSPORT CONFIG
// ======================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// GLOBAL MIDDLEWARE
// ======================
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.currUser = req.user;
  next();
});

// ======================
// ROUTES
// ======================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ======================
// ERROR HANDLING
// ======================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ======================
// SERVER
// ======================
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
