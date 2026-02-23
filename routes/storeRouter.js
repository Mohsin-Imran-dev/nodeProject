const express = require("express");
const storeController = require("../controllers/storeController");
const storeRouter = express.Router();

storeRouter.get("/", storeController.addIndex);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/index", storeController.addHome);
storeRouter.get("/favourites", storeController.getFavoriteList);
storeRouter.get("/index/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavorites); 
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavorites);
module.exports = storeRouter;
