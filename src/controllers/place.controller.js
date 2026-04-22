import mongoose from "mongoose";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import  {Place}  from "../models/place.model.js";
import { User } from "../models/user.model.js";
import getCoordsForAddress from "../utils/location.js";

// 1. Create a new place
const createPlace = async (req, res, next) => {
    const { title, description, location, address } = req.body;
    
    try{
       const placeimagePath = req.file?.path;
    if (!placeimagePath) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const placeImage = await uploadOnCloudinary(placeimagePath);

    if (!placeImage) {
      return res.status(400).json({ message: "Place Image upload failed" },);
    }

      let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

      const newPlace = await Place.create({
          title,
          description,
          location: coordinates,
          address,
          placeImage: placeImage.url,
         creator: req.user._id,
        });
        await User.findByIdAndUpdate(newPlace.creator, { $push: { places: newPlace._id } }, { new: true })
        await newPlace.save();
        res.status(201).json({ message: "Place created", newPlace });
    }catch(err){
      next(err);
        res.status(500).json({ message: 'Failed to create place', error: err.message });
    
    }
}
// 2. Get all places
const getAllPlaces = async (req, res) => {
    try{
      const getAllPlaces = await User.findById(req.params.id).populate("places");
        await getAllPlaces.save();
        res.status(201).json({ message: "Place created", getAllPlaces });
    }catch(err){
        res.status(500).json({ message: 'Failed to get place',error: err.message });
    
    }
}
// 3. Get a single place by ID
const getPlaceById = async (req, res) => {
    try{
        const getPlaceById = await Place.findById(req.params.id);
        if(!getPlaceById) {
      return res.status(404).json({ message: 'Place not found' });
    }
 res.status(200).json(getPlaceById);
    }catch(err){
        res.status(500).json({ message: 'Failed to get places', error: err.message });
    
    }
};
// 4. Update a place
const updatePlaceById = async (req, res) => {
 if (!req.body) {
    return res.status(400).json({ message: "Request body missing" });
  }

      const { title, description, placeImage, location } = req.body;
      console.log(req.body, "vipul")
        try{
   const updatedPlace = await Place.findByIdAndUpdate(req.params.id, {
      title,
      description,
      placeImage,
      location
    }, { new: true });
    
    if (!updatedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }
    
    res.status(200).json(updatedPlace);
        }catch(err){
        res.status(500).json({ message: 'Failed to update place', error: err.message});    
    }
};
// 5. Delete a place
// const deletePlaceById = async (req, res) => {
//         try{
//               const deletedPlace = await Place.findByIdAndDelete(req.params.id);
//     if (!deletedPlace) {
//       return res.status(404).json({ message: 'Place not found' });
//     }
//     res.status(200).json({ message: 'Place deleted successfully' });
//         }catch(err){
//         res.status(500).json({ message: 'Failed to delete place', error: err.message });
//     }
// };
const deletePlaceById = async (req, res) => {
  debugger;
  try {
    const placeId = new mongoose.Types.ObjectId(req.params.id);
    //console.log(placeId)
    // 1. Find place first
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    // 2. Remove place from user's places array
    await User.findByIdAndUpdate(place.creator, {
      $pull: { places: placeId }
    });

    // 3. Delete place
    await Place.findByIdAndDelete(placeId);

    res.status(200).json({ message: "Place deleted successfully" });

  } catch (err) {
    res.status(500).json({
      message: "Failed to delete place",
      error: err.message
    });
  }
};
export { createPlace, getAllPlaces, getPlaceById, updatePlaceById, deletePlaceById };