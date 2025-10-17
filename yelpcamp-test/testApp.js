if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = process.env.PORT || 4000;

console.log("PORT:", port);
console.log("DB_URL:", process.env.DB_URL);

// Mongoose 연결 테스트
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 연결 제한 시간 10초
  })
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Test app running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
