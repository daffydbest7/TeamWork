import express from "express";

import {
  postGif,
  getAllGif,
  getSingleGif,
  getUserGif,
  updateGif,
  deleteGif,
  getGifById
} from "../controllers/gifController.js";
const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware.js";

router.post("/gif/postgif", authGuard, postGif );
router.get("/getgif", authGuard, getAllGif);
router.get("/getgif/:title", authGuard, getSingleGif);
router.get("/getusergif", authGuard, getUserGif);
//employees can view a specific gif
router.get("/gif/:id", authGuard, getGifById);

router.put("/updategif", authGuard, updateGif);
router.delete("/deletegif/:id", authGuard, deleteGif);

module.exports = router;