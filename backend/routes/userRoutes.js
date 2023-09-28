import express from "express";

import {
  createUser,
  loginUser,
  getAllUsers
} from "../controllers/userController.js";
const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware.js";

router.post("/auth/create-user", authGuard, createUser );
router.post("/login", loginUser);
router.get("/getusers", authGuard, getAllUsers);


module.exports = router;