// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure storage: save files to /uploads and keep unique names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base.replace(/\s+/g, "-") + "-" + Date.now() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit (adjust if needed)
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// POST /api/uploads/cover
router.post("/cover", upload.single("cover"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // This URL must be reachable from frontend (Render static mount already exists)
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    message: "Cover image uploaded",
    url: fileUrl,
  });
});

module.exports = router;
