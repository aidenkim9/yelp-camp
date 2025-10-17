const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const campgroundSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [ImageSchema],
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { toJSON: { virtuals: true } }
);

campgroundSchema.virtual("properties.popup").get(function () {
  return `<b><a href="/campgrounds/${this._id}">${this.title}</a></b>
          <p>${this.description.slice(0, 40)}...</p>
  `;
});

campgroundSchema.post("findOneAndDelete", async function (data) {
  if (data.reviews.length) {
    await Review.deleteMany({ _id: { $in: data.reviews } });
  }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
