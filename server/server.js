import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req,res) => {
    res.send("<h1>Hello welcome to agro vision</h1>");
});

app.listen(5000,() => console.log("your app is running on port: http://localhost:5000"));