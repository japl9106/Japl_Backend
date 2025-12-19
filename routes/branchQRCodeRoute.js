// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const BranchQRCode = require('../models/BranchQRCode');

// // Ensure upload directory exists
// const uploadDir = path.join(__dirname, '../uploads/qr-codes');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Multer storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const branchKey = req.body.branchKey || 'unknown';
//     const safeBranchKey = branchKey.replace(/::/g, '_'); // avoid colons in filenames
//     cb(null, `${safeBranchKey}-${Date.now()}${ext}`);
//   },
// });
// const upload = multer({ storage });

// // POST upload QR code with branchKey
// router.post('/upload', upload.single('qrCodeImage'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//     const branchKey = req.body.branchKey;
//     if (!branchKey) return res.status(400).json({ message: 'branchKey required' });

//     const qrCodeImageURL = `/uploads/qr-codes/${req.file.filename}`;

//     const updated = await BranchQRCode.findOneAndUpdate(
//       { branchKey },
//       { qrCodeImageURL, updatedAt: new Date() },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     res.status(200).json(updated);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET QR code by branchKey
// router.get('/:branchKey', async (req, res) => {
//   try {
//     console.log("Requested branchKey:", req.params.branchKey);
//     const qr = await BranchQRCode.findOne({ branchKey: req.params.branchKey });
//     if (!qr) {
//       console.log("No QR code found for:", req.params.branchKey);
//       return res.status(404).json({ message: 'QR code not found for branch' });
//     }
//     res.status(200).json(qr);
//   } catch (error) {
//     console.error("Server error fetching QR code:", error);
//     res.status(500).json({ message: error.message });
//   }
// });


// // DELETE QR code by branchKey
// router.delete('/:branchKey', async (req, res) => {
//   try {
//     const deleted = await BranchQRCode.findOneAndDelete({ branchKey: req.params.branchKey });
//     if (!deleted) return res.status(404).json({ message: 'QR code not found' });
//     res.status(200).json({ message: 'QR code deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BranchQRCode = require('../models/BranchQRCode');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/qr-codes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const branchKey = req.body.branchKey || 'unknown';
    const safeBranchKey = branchKey.replace(/::/g, '_'); // avoid colons in filenames
    cb(null, `${safeBranchKey}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// POST upload QR code with branchKey
router.post('/upload', upload.single('qrCodeImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const branchKey = req.body.branchKey;
    if (!branchKey) return res.status(400).json({ message: 'branchKey required' });

    const qrCodeImageURL = `/uploads/qr-codes/${req.file.filename}`;

    const updated = await BranchQRCode.findOneAndUpdate(
      { branchKey },
      { qrCodeImageURL, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET QR code by branchKey
router.get('/:branchKey', async (req, res) => {
  try {
    // console.log("Requested branchKey:", req.params.branchKey);
    const qr = await BranchQRCode.findOne({ branchKey: req.params.branchKey });
    if (!qr) {
      console.log("No QR code found for:", req.params.branchKey);
      return res.status(404).json({ message: 'QR code not found for branch' });
    }
    res.status(200).json(qr);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
