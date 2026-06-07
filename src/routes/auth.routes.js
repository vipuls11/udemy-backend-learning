import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { getUsers, login, register, userdetails } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/", getUsers)
router.post("/register", upload.single("useravatar"), register);
router.post("/login", login);
router.get("/login/:id", userdetails);

export default router;