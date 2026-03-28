
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const BranchQRCode = require('../models/BranchQRCode');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for QR Codes
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "japl/qrcodes",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      const branchKey = req.body.branchKey || 'unknown';
      const safeBranchKey = branchKey.replace(/::/g, '_').replace(/\s+/g, '-');
      return `${safeBranchKey}-${Date.now()}`;
    },
  },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('qrCodeImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const branchKey = req.body.branchKey;
    if (!branchKey) {
      return res.status(400).json({ message: 'branchKey required' });
    }

    // Use Cloudinary URL
    const qrCodeImageURL = req.file.path;

    const updated = await BranchQRCode.findOneAndUpdate(
      { branchKey },
      { qrCodeImageURL, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    console.error('QR upload error:', error);
    return res.status(500).json({ message: error.message });
  }
});


// GET QR code by branchKey
router.get('/:branchKey', async (req, res) => {
  try {
    const { branchKey } = req.params;
    let qr = await BranchQRCode.findOne({ branchKey });

    // Fallback 1: If requested with a full key (A::B), try searching for just the sub-branch part (B)
    if (!qr && branchKey.includes('::')) {
      const subBranch = branchKey.split('::')[1];
      qr = await BranchQRCode.findOne({ branchKey: subBranch });
    }

    // Fallback 2: If requested with just a sub-branch (B), try searching for any key ending in ::B (A::B)
    if (!qr) {
      qr = await BranchQRCode.findOne({ branchKey: { $regex: new RegExp(`::${branchKey}$`) } });
    }

    if (!qr) {
      return res.status(404).json({ message: 'QR Code not found' });
    }
    res.json(qr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE QR code by branchKey
router.delete('/:branchKey', async (req, res) => {
  try {
    const deleted = await BranchQRCode.findOneAndDelete({ branchKey: req.params.branchKey });
    if (!deleted) return res.status(404).json({ message: 'QR code not found' });
    res.status(200).json({ message: 'QR code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
