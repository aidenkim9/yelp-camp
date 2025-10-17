const User = require("../models/user");

module.exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);
    req.login(newUser, (e) => {
      if (e) {
        next(e);
      }
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (error) {
    req.flash("error", error.message);
    return res.redirect("/register");
  }
};

module.exports.login = (req, res) => {
  const returnToUrl = res.locals.returnTo || "/campgrounds";
  req.flash("success", "Welcome Back!");
  delete req.session.returnTo;
  res.redirect(returnToUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (e) {
    if (e) {
      req.flash("error", e.message);
      return next(e);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/");
  });
};
