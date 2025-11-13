const BranchQRCode = require('../models/BranchQRCode');

// Get QR code by branch name
exports.getQRCodeByBranch = async (req, res) => {
  try {
    const qr = await BranchQRCode.findOne({ branchName: req.params.branchName });
    if (!qr) return res.status(404).json({ message: 'QR code not found for branch' });
    res.status(200).json(qr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update QR code metadata (URL)
exports.upsertQRCode = async (req, res) => {
  try {
    const { branchName, qrCodeImageURL } = req.body;
    if (!branchName || !qrCodeImageURL) {
      return res.status(400).json({ message: 'branchName and qrCodeImageURL required' });
    }
    const updated = await BranchQRCode.findOneAndUpdate(
      { branchName },
      { qrCodeImageURL, updatedAt: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete by branchName or ID as needed
exports.deleteQRCode = async (req, res) => {
  try {
    const deleted = await BranchQRCode.findOneAndDelete({ branchName: req.params.branchName });
    if (!deleted) return res.status(404).json({ message: 'QR code not found for branch' });
    res.status(200).json({ message: 'QR code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
