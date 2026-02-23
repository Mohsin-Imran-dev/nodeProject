const { check, validationResult } = require("express-validator");
const User = require("../Models/user");
const bcrypt = require("bcryptjs");
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    pageName: "Login",
    isLoggedIn: false,
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      pageName: "Login",
      isLoggedIn: false,
      errors: ["User doesn't exist"],
      oldInput: { email },
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      pageName: "Login",
      isLoggedIn: false,
      errors: ["Invalid Password"],
      oldInput: { email },
    });
  }
  req.session.isLoggedIn = true;
  req.session.user = {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
  };
  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    pageName: "signup",
    isLoggedIn: false,
  });
};

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name must be atleast 2 character long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First Name should contain only alphabets"),
  check("lastName")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last Name should contain only alphabets"),
  check("email")
    .isEmail()
    .withMessage("Plz enter a valid email")
    .normalizeEmail(),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 character long")
    .matches(/[a-z]/)
    .withMessage("Password must contain atleast one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain atleast one uppercase letter")
    .matches(/[@#$%^{}.?,:<>&*()]/)
    .withMessage("Password must contain atleast one special character")
    .trim(),
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),
  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid User type"),
  check("agreeTerms")
    .notEmpty()
    .withMessage("Please accept the term and conditions")
    .custom((value, { req }) => {
      if (value != "on") {
        throw new Error("Please accept the term and conditions");
      }
      return true;
    }),
  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "SignUp",
        pageName: "Signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
      });
    }
    bcrypt
      .hash(password, 12)
      .then((hashPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashPassword,
          userType,
        });
        return user.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        return res.status(422).render("auth/signup", {
          pageTitle: "SignUp",
          pageName: "Signup",
          isLoggedIn: false,
          errors: [err.message],
          oldInput: { firstName, lastName, email, password, userType },
        });
      });
  },
];
