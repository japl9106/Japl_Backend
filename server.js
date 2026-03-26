require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- DATABASE CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI;

// Ensure MONGODB_URI is defined
if (!MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// --- ENVIRONMENT VARIABLES AND PORT ---
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(express.json());

// CORS Middleware
let allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", 
];

if (process.env.CORS_ORIGIN) {
  // Split by comma and add to allowed list (removes spaces)
  const prodOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  allowedOrigins = [...allowedOrigins, ...prodOrigins];
}

app.use(cors({
  origin: function (origin, callback) {
    // If no origin (like mobile apps/postman/curl), allow it
    if (!origin) return callback(null, true);
    
    // Check if the current origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const blogRoutes = require('./routes/blogRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const branchQRCodeRoutes = require('./routes/branchQRCodeRoute');
const uploadRoutes = require("./routes/uploadRoutes");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// add:
app.use("/api/uploads", uploadRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/branchqrcode', branchQRCodeRoutes);


// Basic test route
app.get('/', (req, res) => {
    res.send('JAPL Backend API is running!');
});

app.get("/api/vehicles", (req, res, next) => {
    console.log("GET /api/vehicles from", req.ip, req.headers.origin);
    next();
});


// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // No longer logging CORS Origins as it's hardcoded and obvious from the code
});