// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage: upload to Cloudinary directly
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "japl/blogs", // All blog images will be in this folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      // Use original filename without extension + unique timestamp
      const originalName = file.originalname.split(".")[0];
      return `${originalName.replace(/\s+/g, "-")}-${Date.now()}`;
    },
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Allowed up to 5MB for Cloudinary
});

// POST /api/uploads/cover
router.post("/cover", upload.single("cover"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Cloudinary property is req.file.path which stores the direct URL
  const fileUrl = req.file.path;

  res.status(201).json({
    message: "Cover image uploaded successfully to Cloudinary",
    url: fileUrl,
  });
});

module.exports = router;
