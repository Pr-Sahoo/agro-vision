
// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";


// const app = express();
// connectDB();
// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);

// app.listen(process.env.PORT,() => {
//     console.log("server is running on port: http://localhost:5000");
// });


// POST /api/auth/register
// POST /api/auth/verify-otp
// POST /api/auth/login


import dotenv from "dotenv";
dotenv.config();

import express  from "express";
import cors     from "cors";

import connectDB          from "./config/db.js";
import authRoutes         from "./routes/authRoutes.js";
import cropRoutes         from "./routes/cropRoutes.js";
import aiRoutes           from "./routes/aiRoutes.js";
import weatherRoutes      from "./routes/weatherRoutes.js";
import { handleUploadError } from "./middleware/uploadMiddleware.js";
import { startScheduler } from "./utils/scheduler.js";

const app = express();

// ── Connect to MongoDB Atlas ─────────────────────────────────────────────────
connectDB();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// urlencoded needed to read text fields from multipart/form-data (cropId etc.)
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/crops",   cropRoutes);
app.use("/api/ai",      aiRoutes);
app.use("/api/weather", weatherRoutes);

// ── Global Multer Error Handler ──────────────────────────────────────────────
// MUST come AFTER routes — Express error handlers are always last
// Catches: file too large, wrong file type, etc.
app.use(handleUploadError);

// ── Global Catch-All Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error." });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 AgroVision server running: http://localhost:${PORT}`);
  console.log("\nAPI Endpoints:");
  console.log("  POST   /api/auth/register");
  console.log("  POST   /api/auth/verify-otp");
  console.log("  POST   /api/auth/login");
  console.log("  POST   /api/crops");
  console.log("  GET    /api/crops");
  console.log("  GET    /api/crops/:id");
  console.log("  DELETE /api/crops/:id");
  console.log("  POST   /api/ai/advice");
  console.log("  POST   /api/ai/disease-detection  ← image upload");
  console.log("  GET    /api/weather");

  // Start the cron job — sends advice every 3 hours
  startScheduler();
});