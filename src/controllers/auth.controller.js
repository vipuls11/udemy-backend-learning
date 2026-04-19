
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password');

    res.json({
      users: users.map(user =>
        user.toObject({ getters: true })
      )
    });

  } catch (err) {
    return next(
      new HttpError(
        'Fetching users failed, please try again later.',
        500
      )
    );
  }
};
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //const avatarLocalPath = req.files?.useravatar?.[0]?.path;
const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      return res.status(400).json({ message: "Avatar upload failed" },);
    }

    const user = await User.create({
      username,
      email,
      password,
      useravatar: avatar.url,
    });

       await user.save();

        // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

      // Optionally, you can store the refresh token in the database
    user.refreshToken = refreshToken;
     await user.save();
    res.status(201).json({ message: "User created", user },{
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({message: `User logged In ${user.username}`, accessToken, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};