import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import DBConnection from "./config/DBConnection.js";
import authRoutes from "./routes/auth.routes.js";
import placeRoutes from "./routes/place.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());

app.get('/', (req, res) => res.send('Hello World!'))
 app.use("/api/auth", authRoutes);
 app.use("/api/user", placeRoutes);


DBConnection()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
