require("dotenv").config();

const express = require("express");
const path = require("path");
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MongoDB connection string is missing");
  process.exit(1);
}

// ✅ SIMPLE OPTIONS - Sirf yeh do
const mongoOptions = {
  tls: true, // TLS enable
  tlsAllowInvalidCertificates: true, // Self-signed certs allow
};

console.log("🔄 Connecting to MongoDB...");

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, mongoOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Session store - with clean options
    const store = new MongoDBStore({
      uri: MONGO_URL,
      collection: "sessions",
      mongooseConnection: mongoose.connection,
      // Clean options for session store
      connectionOptions: {
        tls: true,
        tlsAllowInvalidCertificates: true,
      },
    });

    store.on("error", (error) => {
      console.log("⚠️ Session store error:", error.message);
    });

    // Middleware
    app.use(express.static(path.join(rootDir, "public")));
    app.use(express.urlencoded({ extended: true }));

    app.use(
      session({
        secret: "Knowledge Gate AI",
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // true in production with HTTPS
        },
      }),
    );

    // Locals middleware
    app.use((req, res, next) => {
      res.locals.isLoggedIn = req.session.isLoggedIn;
      res.locals.userType = req.session.user ? req.session.user.userType : null;
      next();
    });

    app.use((req, res, next) => {
      req.isLoggedIn = req.session.isLoggedIn;
      next();
    });

    // Routes
    app.use(storeRouter);
    app.use(authRouter);

    app.use("/host", (req, res, next) => {
      if (req.isLoggedIn) next();
      else res.redirect("/login");
    });

    app.use("/host", hostRouter);
    app.use(errorsController.pageNotFound);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      // Important: '0.0.0.0' for Railway
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Error while connecting to MongoDB:", err.message);
    console.log(
      "Connection string used:",
      MONGO_URL.replace(/:[^:@]+@/, ":****@"),
    );
    process.exit(1);
  });
