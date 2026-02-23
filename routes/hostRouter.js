const express = require("express");
const hostController = require("../controllers/hostController");
const storeController = require("../controllers/storeController");
const hostRouter = express.Router();
hostRouter.get("/add-home", hostController.getAddHome);

hostRouter.post("/add-home", hostController.postAddHome);
hostRouter.get("/bookings", storeController.getBookings);
hostRouter.get("/host-home-list", hostController.addHostHome);
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);
module.exports = hostRouter;
