const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./koreanCities300.js");
const { descriptors, places } = require("./seedHelpers");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("✅ CONNECTION TO YELP CAMP DB!");
  })
  .catch((err) => {
    console.log("CONNECTION ERR!");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// const randomImg = async (n) => {
//   const response = await fetch(
//     `https://api.unsplash.com/photos/random?client_id=${process.env.UNSPLASH_CLIENT_ID}&query=forest&count=${n}`
//   );
//   const data = await response.json();
//   return data.map((item) => item.urls.regular);
// };

const seedDB = async () => {
  await Campground.deleteMany({});
  // const imgUrl = await randomImg(10);
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 300);
    const price = Math.floor(Math.random() * 30) + 20;
    const camp = new Campground({
      title: `${cities[random1000].city} ${cities[random1000].state}`,
      location: `${sample(descriptors)} ${sample(places)}`,
      price,
      author: "68e774161a9adda9d08819f4",
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cupiditate soluta eligendi aliquid assumenda dolores blanditiis, amet aperiam quod ad explicabo libero, atque est! Recusandae repellendus cum laudantium cumque voluptas at?",
      images: {
        url: "https://res.cloudinary.com/dt7du44ex/image/upload/v1760167081/yelp-camp/nh7kbndroruwwf7owxm2.png",
        filename: "yelp-camp/nh7kbndroruwwf7owxm2",
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
