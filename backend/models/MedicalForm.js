const mongoose = require("mongoose");

const MedicalSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Link to user
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  medical_conditions: { type: [String], required: true },
  allergies: { type: [String], required: true },
  medications: { type: [String], required: true },
});

module.exports = mongoose.model("Medical", MedicalSchema);
