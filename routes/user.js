const express = require("express");
const passport = require("passport");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middlewares");
const userControllers = require("../controllers/users");

router
  .route("/register")
  .get((req, res) => {
    res.render("users/register");
  })
  .post(catchAsync(userControllers.createUser));

router
  .route("/login")
  .get((req, res) => {
    res.render("users/login");
  })
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userControllers.login
  );

router.get("/logout", userControllers.logout);

module.exports = router;
