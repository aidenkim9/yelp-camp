const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// Controllers
const campgroundControllers = require("../controllers/campgrounds.js");

// Utils
const catchAsync = require("../utils/catchAsync.js");

const {
  isLoggedIn,
  validateCampground,
  isAuthor,
} = require("../middlewares.js");

// ======================
// campgrounds Routes
// ======================

router
  .route("/")
  .get(catchAsync(campgroundControllers.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgroundControllers.createCampground)
  );

router.get("/new", isLoggedIn, campgroundControllers.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgroundControllers.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgroundControllers.updateCampground)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundControllers.deleteCampground)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundControllers.editCampground)
);

module.exports = router;
