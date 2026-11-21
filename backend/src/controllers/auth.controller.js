import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password, role, department } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role?.trim() || "Workspace Member",
      department: department?.trim() || "Dev",
      labels: [department?.trim() || "Dev"],
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        role: newUser.role,
        department: newUser.department,
        labels: newUser.labels,
        createdAt: newUser.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      department: user.department,
      labels: user.labels,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, role, department, labels } = req.body;
    const userId = req.user._id;

    if (!profilePic && !fullName && !role && !department && !labels) {
      return res.status(400).json({ message: "Profile update data is required" });
    }

    const updateFields = {};

    if (fullName && fullName.trim()) {
      updateFields.fullName = fullName.trim();
    }

    if (role !== undefined && role.trim()) {
      updateFields.role = role.trim();
    }

    if (department !== undefined && department.trim()) {
      updateFields.department = department.trim();
    }

    if (Array.isArray(labels)) {
      updateFields.labels = labels;
    }

    if (profilePic) {
      let profilePicUrl = profilePic;
      try {
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name"
        ) {
          const uploadResponse = await cloudinary.uploader.upload(profilePic);
          profilePicUrl = uploadResponse.secure_url;
        }
      } catch (uploadError) {
        console.log(
          "Cloudinary upload failed, falling back to data URI:",
          uploadError.message
        );
      }
      updateFields.profilePic = profilePicUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};