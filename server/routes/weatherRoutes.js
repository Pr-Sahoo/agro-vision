import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getWeather } from "../controller/weatherController.js";

const router = express.Router();

router.use(authMiddleware);

// GET /api/weather?lat=18.5&lon=73.8
// GET /api/weather?cropId=664abc123
router.get("/", getWeather);

export default router;
