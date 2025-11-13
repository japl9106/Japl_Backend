
// src/routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/authMiddleware');


// Get all vehicles with necessary fields for listing
// router.get('/', async (req, res) => {
//   try {
//     // const vehicles = await Vehicle.find().select('name images quickSpecs brochure');
//     const vehicles = await Vehicle.find().select('name images quickSpecs brochure detailedSpecs');
//     res.json(vehicles);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// src/routes/vehicleRoutes.js
router.get('/', async (req, res) => {
  try {
    const { category, subCategory, fuel } = req.query;
    const filter = {};

    // Use RegExp for case-insensitive and whole-value matching  
    if (category) {
      filter['detailedSpecs.Vehicle Information.Product Category'] = new RegExp(`^${category.trim()}$`, 'i');
    }
    if (fuel) {
      filter['detailedSpecs.Performance.Fuel Type'] = new RegExp(`^${fuel.trim()}$`, 'i');
    }
    // If you have subCategory info in a nested field, update path below
    // if (subCategory) {
    //   filter['detailedSpecs.Vehicle Information.SubCategoryField'] = new RegExp(`^${subCategory.trim()}$`, 'i');
    // }

    const vehicles = await Vehicle.find(filter).select(
      'name model images quickSpecs brochure detailedSpecs'
    );

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new vehicle (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const vehicle = new Vehicle(req.body);
    const newVehicle = await vehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: 'Validation failed', error: err.message });
  }
});

// Update vehicle (Admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Delete vehicle (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
    console.log('vehicle deleted successfuly..');
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
     console.log(err);
  }
});

router.delete('/bulk', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body; // Expect an array of IDs in the request body

        // Basic validation: Ensure 'ids' is an array and not empty
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of vehicle IDs for bulk deletion.' });
        }

        // Use Mongoose's deleteMany to remove multiple documents
        const result = await Vehicle.deleteMany({ _id: { $in: ids } });

        // Check if any documents were actually deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No vehicles found with the provided IDs to delete.' });
        }

        res.status(200).json({
            message: `${result.deletedCount} vehicle(s) deleted successfully.`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('Error during bulk vehicle deletion:', err);
        res.status(500).json({ message: 'Server error during bulk deletion', error: err.message });
    }
});

module.exports = router;