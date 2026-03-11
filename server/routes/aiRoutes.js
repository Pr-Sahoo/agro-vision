import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
import { getAdvice, detectDisease } from "../controller/aiController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/advice", getAdvice);

router.post(
  "/disease-detection",
  uploadSingle("image"),   // multer middleware, field name must be "image"
  detectDisease
);

export default router;
