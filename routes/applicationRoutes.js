// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Application = require('../models/Application');
const JobPost = require('../models/JobPost');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for Resumes (PDF/DOCX)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "japl/resumes",
    resource_type: "raw", // CRITICAL: This allows PDF and DOCX files
    public_id: (req, file) => {
      const originalName = file.originalname.split(".")[0];
      return `${originalName.replace(/\s+/g, "-")}-${Date.now()}`;
    },
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Allowed up to 10MB for resumes
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and DOCX files are allowed!'));
  },
}).single('resume');

// --- Public Route: Submit Job Application ---
// @route   POST /api/applications
// @desc    Submit a new job application with resume
// @access  Public
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required.' });
    }

    const { jobId, applicantName, applicantEmail, applicantPhone } = req.body;

    if (!jobId || !applicantName || !applicantEmail || !applicantPhone) {
      return res.status(400).json({ message: 'All form fields (Name, Email, Phone) and a resume are required.' });
    }

    try {
      const jobExists = await JobPost.findById(jobId);
      if (!jobExists || !jobExists.isActive) {
        return res.status(404).json({ message: 'Job not found or is inactive.' });
      }

      // Create new application entry
      const newApplication = new Application({
        jobPost: jobId,
        applicantName,
        applicantEmail,
        applicantPhone,
        resumePath: req.file.path, // This is now the Cloudinary URL
      });

      await newApplication.save();
      res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
    } catch (dbErr) {
      console.error('Database error saving application:', dbErr);
      res.status(500).json({ message: 'Failed to save application details.' });
    }
  });
});


// --- Admin Route: Get All Job Applications ---
// @route   GET /api/applications
// @desc    Get all job applications (for admin panel)
// @access  Private (e.g., requires admin authentication middleware)
router.get('/', async (req, res) => {
  try {
    // Populate jobPost to get job title and company directly
    const applications = await Application.find().populate('jobPost', 'title company'); // Only fetch title and company
    res.status(200).json(applications);
  } catch (err) {
    console.error('Error fetching applications for admin:', err);
    res.status(500).json({ message: 'Server error fetching applications.' });
  }
});


module.exports = router;