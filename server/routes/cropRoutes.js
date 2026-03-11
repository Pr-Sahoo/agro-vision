import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCrop,
  getCrops,
  getCropById,
  deleteCrop
} from "../controller/cropController.js";

const router = express.Router();

// All crop routes are protected — user must be logged in
router.use(authMiddleware);

router.post("/",        createCrop);    // POST   /api/crops
router.get("/",         getCrops);      // GET    /api/crops
router.get("/:id",      getCropById);   // GET    /api/crops/:id
router.delete("/:id",   deleteCrop);    // DELETE /api/crops/:id

export default router;
