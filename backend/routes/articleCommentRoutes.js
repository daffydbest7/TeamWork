import express from "express";

import {
  getArticleCommentByArticleId,
  createComment,
  
 
} from "../controllers/articleCommentController.js";
const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware.js";


router.get("/article/comments/:article_id", authGuard, getArticleCommentByArticleId );
router.post("/article/:article_id/comment", authGuard, createComment );

module.exports = router;