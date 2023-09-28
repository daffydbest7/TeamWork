import express from "express";
import {viewArticleOrGif} from "../controllers/articleAndGifController";
import {
  createArticle,
  deleteArticle,
  updateArticle,
  getAllArticle,
  getSingleArticle,
  getAllArticlesByUserId,
  getArticleById,
 
} from "../controllers/articleController.js";
const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware.js";

router.post("/createarticle", authGuard, createArticle );
router.delete("/deletearticle/:id", authGuard, deleteArticle );
router.put("/updatearticle/:title", authGuard, updateArticle );
router.get("/article/getallarticle", getAllArticle );
router.get("/article/getsingle/:id", authGuard, getSingleArticle );
router.get("/article/getAllArticlesByUserId", authGuard,  getAllArticlesByUserId );
//view all feed
router.get("/feed", authGuard, viewArticleOrGif );
//employees can view a specific article
router.get("/articles/:id", authGuard, getArticleById );

module.exports = router;