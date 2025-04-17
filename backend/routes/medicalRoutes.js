const express = require("express");
const Medical = require("../models/MedicalForm");

const router = express.Router();

const medicalController = require("../controllers/medicalController");
const multer = require("multer");

// Configure Multer for PDF upload
const upload = multer({ dest: "uploads/" });



// Upload prescription route
// ✅ Upload Prescription Route
router.post("/upload-prescription", upload.single("prescription"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }
        
        // console.log("you re in route");
        // console.log(req);
        // console.log(`Received Prescription: ${req.file.originalname}`);
        const result = await medicalController.uploadPrescription(req,res);
        console.log("you re in route");
        // console.log(result);


        // res.status(200).json({ message: "Prescription uploaded successfully!", data: result });

    } catch (error) {
        console.error("🔥 ERROR: Prescription upload failed!", error);
        // res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
});





// ✅ Save Medical Details Route
router.post("/save", async (req, res) => {
    try {
        const { email, age, gender, medical_conditions, allergies, medications } = req.body;

        if (!email || !age || !gender) {
            return res.status(400).json({ error: "Email, age, and gender are required." });
        }

        let medicalRecord = await Medical.findOne({ email });

        if (medicalRecord) {
            return res.status(400).json({ error: "Medical details already exist!" });
        }

        medicalRecord = new Medical({ email, age, gender, medical_conditions, allergies, medications });
        await medicalRecord.save();

        console.log(`✅ Medical details saved for ${email}`);
        res.status(201).json({ message: "Medical details saved successfully!" });

    } catch (error) {
        console.error("🔥 ERROR: Saving medical details failed!", error);
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
});




// ✅ Get User Medical Details Route
router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const medicalRecord = await Medical.findOne({ email });

        if (!medicalRecord) {
            return res.status(404).json({ error: "No medical details found!" });
        }

        console.log(`📄 Medical Record Fetched for ${email}`);
        res.status(200).json(medicalRecord);

    } catch (error) {
        console.error("🔥 ERROR: Fetching medical details failed!", error);
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
});
module.exports = router;
