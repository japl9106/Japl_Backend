require('dotenv').config();
const express = require('express');
const { connect } = require('mongoose');
const cors = require('cors');
const { join } = require('path');

// --- DATABASE CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI;

// Ensure MONGODB_URI is defined
if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
  process.exit(1);
}

connect(MONGODB_URI)
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
  const prodOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/+$/, ''));
  allowedOrigins = [...allowedOrigins, ...prodOrigins];
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const blogRoutes = require('./routes/blogRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const branchQRCodeRoutes = require('./routes/branchQRCodeRoute');
const uploadRoutes = require("./routes/uploadRoutes");

app.use('/uploads', express.static(join(__dirname, 'uploads')));
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