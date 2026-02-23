const express = require("express");
const path = require("path");
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const DB_PATH =
  "mongodb+srv://root:7272@mcoding.9qq795b.mongodb.net/airbnb?appName=mCoding";
const { default: mongoose } = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
})
app.use(express.static(path.join(rootDir, "public")));
app.use(express.urlencoded());
app.use(
  session({
    secret: "Knowledge Gate AI",
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.userType = req.session.user
    ? req.session.user.userType
    : null;
  next();
});
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});
app.use(storeRouter);
app.use(authRouter);

app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);
app.use(errorsController.pageNotFound);

const PORT = 3000;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to mongo");
    app.listen(PORT, () => {
      console.log(`Server listening on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to mongoose: " + err);
  });
