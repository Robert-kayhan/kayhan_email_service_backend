// src/index.ts
import express from "express";
import connectDb from "./db/connectDb";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors"
//routes
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
const app = express();
const PORT = process.env.PORT|| 5002;


//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
dotenv.config();
 app.use(
  cors({
    origin: "http://localhost:3000", // your Next.js frontend
    credentials: true, // allow cookies to be sent
  })
);

//routes
app.use("/api/auth/",authRoutes)
app.use("/api/users/",userRoutes)


connectDb()

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
