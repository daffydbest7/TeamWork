import express from "express";

import {
  getCommentByGifId,
  createGifComment,
  
 
} from "../controllers/gifCommentController.js";
const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware.js";


router.get("/gif/comments/:gif_id", authGuard, getCommentByGifId );
router.post("/gif/:gif_id/comment", authGuard, createGifComment );

module.exports = router;