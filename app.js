if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const helmet = require("helmet");
const mongoStore = require("connect-mongo");

// Utils
const AppError = require("./utils/AppError.js");

// Routes
const userRoutes = require("./routes/user.js");
const campgroundRoutes = require("./routes/campgrouds.js");
const reviewRoutes = require("./routes/reviews.js");

const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
const secret = process.env.CONFIG_SECRET || "thisisyelpcampsecret!!";
const port = process.env.PORT || 4000;

console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔍 PORT:", port);
console.log(
  "🔍 DB_URL (첫 40자):",
  DB_URL ? DB_URL.slice(0, 40) + "..." : "❌ 없음"
);

//DB CONNECTION

// mongoose
//   .connect(DB_URL, )
//   .then(() => {
//     console.log("✅ CONNECTION TO YELP CAMP DB!");
//   })
//   .catch((err) => {
//     console.log("CONNECTION ERR!");
//     console.log(err);
//   });

(async () => {
  try {
    console.log("🚀 Trying to connect to MongoDB Atlas...");

    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 10000, // 10초 대기
      connectTimeoutMS: 10000, // 네트워크 연결 시간 제한
      socketTimeoutMS: 20000, // 소켓 유지시간
    });

    console.log("✅ MongoDB connection established successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed!");
    console.error("📄 Error name:", err.name);
    console.error("📄 Error message:", err.message);

    // Atlas 연결 실패 시 원인 별 안내
    if (err.message.includes("ReplicaSetNoPrimary")) {
      console.error("⚠️ Atlas 클러스터의 IP 화이트리스트를 다시 확인하세요.");
      console.error(
        "⚠️ 0.0.0.0/0, Render outbound IP, 현재 IP 모두 등록되어야 합니다."
      );
    } else if (err.message.includes("authentication")) {
      console.error(
        "⚠️ Atlas 계정 비밀번호(DB_URL) 또는 사용자 권한이 올바른지 확인하세요."
      );
    } else if (err.message.includes("ENOTFOUND")) {
      console.error(
        "⚠️ Atlas 클러스터 주소(cluster0.xxx.mongodb.net)가 잘못된 것 같습니다."
      );
    }

    process.exit(1); // 서버를 종료시켜 Render에서 오류 로그를 표시하게 함
  }
})();

const store = mongoStore.create({
  mongoUrl: DB_URL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

//APP SETTING
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://cdn.jsdelivr.net/",
];
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      scriptSrcElem: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      styleSrcElem: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dt7du44ex/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
    },
  })
);

const sessionConfig = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//RESTful ROUTE
app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/fakeuser", async (req, res) => {
  const user = new User({ email: "aiden@gmail.com", username: "aiden" });
  const newUser = await User.register(user, "pig");
  res.send(newUser);
});

app.get("/", async (req, res) => {
  res.render("home");
});

//error handling middleware
app.use((req, res, next) => {
  next(new AppError("PAGE NOT FOUND", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  res.status(statusCode).render("campgrounds/error", { err });
});

app.listen(port, () => {
  console.log(`✅ CONNECTION PORT ${port}!`);
});
