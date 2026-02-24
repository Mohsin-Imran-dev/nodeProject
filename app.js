require('dotenv').config();

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
  console.error("MongoDB connection string is missing");
  process.exit(1);
}

// MongoDB connection options - SIRF YEH DO OPTIONS
const mongoOptions = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true, // For self-signed certs
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, mongoOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    // Session store - AB YEH SAHI HAI
    const store = new MongoDBStore({
      uri: MONGO_URL,
      collection: "sessions",
      mongooseConnection: mongoose.connection,
      // Session store options
      connectionOptions: {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true
      }
    });
    
    store.on('error', (error) => {
      console.log('Session store error:', error);
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
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          secure: false // false for local, true for production with HTTPS
        }
      })
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
    
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Error while connecting to MongoDB:", err.message);
    console.log("Connection string used:", MONGO_URL.replace(/:[^:@]+@/, ':****@')); // Hide password
    process.exit(1);
  });