// const User = require("../models/user.js");

// module.exports.renderSignupForm = (req, res) => {
//   res.render("users/signup.ejs");
// }

// module.exports.signup = async (req, res, next) => {
//   try {
//     const { username, email, password } = req.body;
//     const newUser = new User({ email, username });
//     const registeredUser = await User.register(newUser, password);

//     // Safe login
//     req.login(registeredUser, (err) => {
//       if (err) {
//         return next(err); // ✅ now next is defined
//       }
//       req.flash("success", "Welcome to Wanderlust!");
//       res.redirect("/listings"); // ✅ redirect works
//     });
//   } catch (e) {
//     req.flash("error", e.message);
//     res.redirect("/signup");
//   }
// };


//   module.exports.renderLoginForm = (req, res) => {
//   res.render("users/login.ejs");
// };

// module.exports.login=async (req, res) => {
//     req.flash("success", "Welcome back to Wanderlust! You are logged in!");
//     let redirectUrl = res.locals.redirectUrl || "/listings";
//     res.redirect(redirectUrl);
//   };

// module.exports.logout =(req, res, next) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     req.flash("success", "you are logged out!");
//     res.redirect("/listings");
//   });
// }

const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  return res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to Wanderlust!");
      return res.redirect("/listings"); // 🔥 return added
    });

  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup"); // 🔥 return added
  }
};

module.exports.renderLoginForm = (req, res) => {
  return res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust! You are logged in!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  return res.redirect(redirectUrl); // 🔥 return added
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You are logged out!");
    return res.redirect("/listings"); // 🔥 return added
  });
};
