import express from "express";
import {
  createShortUrl,
  resolveUrl,
  getMyUrls,
} from "../controllers/urlController.js";
import { protect } from "../middlewares/authMiddleware.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// Optional auth middleware for shorten to attach userId if logged in
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_for_dev");
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }
  next();
};

router.post("/shorten", optionalAuth, createShortUrl);
router.get("/resolve/:shortId", resolveUrl);

// Protected routes
router.get("/my", protect, getMyUrls);
import { deleteUrl } from "../controllers/urlController.js";
router.delete("/my/:shortId", protect, deleteUrl);

export default router;