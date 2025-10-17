if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT || 4000;

// MongoDB 연결
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// connect-mongo store 생성
const store = mongoStore.create({
  mongoUrl: process.env.DB_URL,
  crypto: {
    secret: process.env.CONFIG_SECRET || "defaultsecret",
  },
  touchAfter: 24 * 60 * 60,
});

// 세션 미들웨어
app.use(
  session({
    store,
    secret: process.env.CONFIG_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1일
    },
  })
);

// 라우트: 세션 테스트
app.get("/", (req, res) => {
  if (!req.session.views) req.session.views = 0;
  req.session.views++;
  res.send(`👀 Session test: ${req.session.views} views`);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
