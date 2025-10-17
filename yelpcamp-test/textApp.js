if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Test app running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
