const Home = require("../Models/home");
const User = require("../Models/user");

exports.addIndex = (req, res, next) => {
  Home.find().then((registeredHome) => {
    res.render("store/index", {
      registeredHome: registeredHome,
      pageTitle: "airbnd Home",
      pageName: "index",
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.addHome = (req, res, next) => {
  Home.find().then((registeredHome) => {
    res.render("store/home-list", {
      registeredHome: registeredHome,
      pageTitle: "Homes List",
      pageName: "Home",
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    pageName: "bookings",
    isLoggedIn: req.isLoggedIn,
  });
};

// ✅ SIRF YEH FUNCTION CHANGE KARO - user check add karo
exports.getFavoriteList = async (req, res, next) => {
  // Check if user exists in session
  if (!req.session || !req.session.user || !req.session.user._id) {
    return res.redirect("/login");
  }
  
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favorite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    pageName: "favourites",
    isLoggedIn: req.isLoggedIn,
  });
};

// ✅ AUR YEH FUNCTION CHANGE KARO - user check add karo
exports.postAddToFavorites = async (req, res, next) => {
  // Check if user exists in session
  if (!req.session || !req.session.user || !req.session.user._id) {
    return res.redirect("/login");
  }
  
  const homeId = req.body.id.toString();
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

// ✅ AUR YEH FUNCTION CHANGE KARO - user check add karo
exports.postRemoveFromFavorites = async (req, res, next) => {
  // Check if user exists in session
  if (!req.session || !req.session.user || !req.session.user._id) {
    return res.redirect("/login");
  }
  
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      res.redirect("/");
    } else {
      console.log("You requested details for home ID:", homeId);
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        pageName: "Home",
        isLoggedIn: req.isLoggedIn,
      });
    }
  });
};