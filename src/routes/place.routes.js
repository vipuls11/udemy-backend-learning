import express from "express";
import {createPlace, getAllPlaces, getPlaceById, updatePlaceById, deletePlaceById} from "../controllers/place.controller.js"
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/place",verifyJWT, upload.single("placeImage"), createPlace);
router.get("/places/:id", getAllPlaces);
router.get("/place/:id", getPlaceById);
router.put("/place/:id", updatePlaceById);
router.delete("/place/:id", deletePlaceById);


export default router;
