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

// Configure storage: upload to Cloudinary directly (supports both images and videos)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype?.startsWith("video/");
    const safeName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "-");
    return {
      folder: "japl/blogs",
      resource_type: isVideo ? "video" : "image",
      public_id: `${safeName}-${Date.now()}`,
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Allowed up to 100MB in multer
});

// POST /api/uploads/cover with detailed error handler
router.post("/cover", (req, res) => {
  upload.single("cover")(req, res, (err) => {
    if (err) {
      console.error("Cloudinary upload error:", err);
      let userMsg = err.message || "Failed to upload file.";
      if (err.http_code === 400 || (err.message && err.message.toLowerCase().includes("file size"))) {
        userMsg = "Video size is too large for Cloudinary direct upload (Cloudinary free tier limits videos to ~10MB-20MB). Please compress the video or paste a YouTube/Video URL link.";
      }
      return res.status(400).json({ message: userMsg, details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded." });
    }

    const fileUrl = req.file.path;
    const isVideo = req.file.mimetype?.startsWith("video/") || req.file.resource_type === "video";

    return res.status(201).json({
      message: "Media uploaded successfully to Cloudinary",
      url: fileUrl,
      mediaType: isVideo ? "video" : "image",
    });
  });
});

module.exports = router;
