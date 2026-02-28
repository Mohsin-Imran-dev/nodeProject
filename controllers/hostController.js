const Home = require("../Models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnd",
    pageName: "AddHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
  });
};

exports.addHostHome = (req, res, next) => {
  Home.find().then((registeredHome) => {
    res.render("host/host-home-list", {
      registeredHome: registeredHome,
      pageTitle: "Host Homes List",
      pageName: "Host Home",
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, photo, description } = req.body;
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });
  home.save().then(() => {
    console.log("Home Added Successfully");
  });
  res.redirect("/host/host-home-list");
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    if (!home) {
      return res.redirect("/host/host-home-list");
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit Your Home",
      pageName: "Host Home",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.postEditHome = (req, res, next) => {
  const { _id, houseName, price, location, rating, photo, description } =
    req.body;
  Home.findById(_id).then((home) => {
    ((home.houseName = houseName),
      (home.price = price),
      (home.location = location),
      (home.rating = rating),
      (home.photo = photo),
      (home.description = description),
      home.save().then((res) => {
        console.log("Home Updated Successfully" + res);
      }));
    res.redirect("/host/host-home-list");
  });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error deleting home:", error);
    });
};
