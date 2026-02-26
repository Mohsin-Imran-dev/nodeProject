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

// MongoDB options
const mongoOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
};

console.log("🔄 Connecting to MongoDB...");

mongoose
  .connect(MONGO_URL, mongoOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Session store
    const store = new MongoDBStore({
      uri: MONGO_URL,
      collection: "sessions",
      mongooseConnection: mongoose.connection,
      connectionOptions: {
        tls: true,
        tlsAllowInvalidCertificates: true,
      },
    });

    store.on("error", (error) => {
      console.log("⚠️ Session store error:", error.message);
    });

    // ✅ HEALTH CHECK ENDPOINT - SABSE PEHLE
    app.get('/health', (req, res) => {
      res.status(200).send('OK');
    });

    // Middleware
    app.use(express.static(path.join(rootDir, "public")));
    app.use(express.urlencoded({ extended: true }));
// app.js mein session wali line dhundho aur yeh changes karo:

app.use(
  session({
    secret: "Knowledge Gate AI",
    resave: true,              // false se true karo
    saveUninitialized: true,    // false se true karo
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false,            // false hi rakho Railway pe
      sameSite: 'lax'
    },
    name: 'connect.sid'         // add this line
  })
);

app.use((req, res, next) => {
  console.log("🔥 Session ID:", req.sessionID);
  console.log("🔥 isLoggedIn:", req.session?.isLoggedIn);
  console.log("🔥 User:", req.session?.user?.email);
  next();
});
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

    // Routes - STORE ROUTER PEHLE (ismein / route hai)
    app.use(storeRouter);  // ← YEH PEHLE AAYEGA
    app.use(authRouter);

    app.use("/host", (req, res, next) => {
      if (req.isLoggedIn) next();
      else res.redirect("/login");
    });

    app.use("/host", hostRouter);
    app.use(errorsController.pageNotFound);

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Error while connecting to MongoDB:", err.message);
    console.log(
      "Connection string used:",
      MONGO_URL.replace(/:[^:@]+@/, ":****@")
    );
    process.exit(1);
  });