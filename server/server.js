
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";


const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT,() => {
    console.log("server is running on port: http://localhost:5000");
});


// POST /api/auth/register
// POST /api/auth/verify-otp
// POST /api/auth/login