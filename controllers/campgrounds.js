const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");

const mbxClient = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxClient({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  const geoData = await geocodingClient
    .forwardGeocode({
      query: req.body.location,
      limit: 2,
    })
    .send();

  const campGeoData = geoData.body.features[0].geometry;

  const imgs = req.files.map((f) => {
    return { url: f.path, filename: f.filename };
  });
  const campground = new Campground(req.body);
  campground.author = req.user._id;
  campground.images = imgs;
  campground.geometry = campGeoData;

  if (!campground) {
    req.flash("error", "Adding new Campground Failed.");
    return req.redirect("/campgrounds");
  }
  await campground.save();

  req.flash("success", "New campground made successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");

  if (!campground) {
    req.flash("error", "Cannot find campground.");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/show", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash("error", "Cannot find a campground.");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;

  const imgs = req.files.map((f) => {
    return { url: f.path, filename: f.filename };
  });

  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    ...req.body,
  });

  updatedCampground.images.push(...imgs);

  if (req.body.deleteImages) {
    for (let img of req.body.deleteImages) {
      await cloudinary.uploader.destroy(img);
    }

    await updatedCampground.updateOne({
      $pull: {
        images: {
          filename: {
            $in: req.body.deleteImages,
          },
        },
      },
    });
  }

  await updatedCampground.save();

  req.flash("success", "Successfully Updated!");
  res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;

  const deletedCampground = await Campground.findByIdAndDelete(id);

  req.flash("success", "Successfully Deleted!");
  res.redirect("/campgrounds");
};
