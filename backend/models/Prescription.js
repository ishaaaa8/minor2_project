const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
    userEmail: { type: String, required: true }, // Store user identity
    filePath: { type: String, required: true },  // Path to uploaded file
    extractedText: { type: String },             // Extracted text from PDF
    createdAt: { type: Date, default: Date.now } // Timestamp
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
