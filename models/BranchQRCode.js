// const mongoose = require('mongoose');

// const branchQRCodeSchema = new mongoose.Schema({
//   branchKey: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   qrCodeImageURL: {
//     type: String,
//     required: true,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('BranchQRCode', branchQRCodeSchema);

const mongoose = require('mongoose');

const branchQRCodeSchema = new mongoose.Schema({
  branchKey: {
    type: String,
    required: true,
    unique: true,
  },
  qrCodeImageURL: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BranchQRCode', branchQRCodeSchema);
