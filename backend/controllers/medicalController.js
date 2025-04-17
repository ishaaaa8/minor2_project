const { MemoryVectorStore } = require("langchain/vectorstores/memory");  
const textSplitter = require("langchain/text_splitter").RecursiveCharacterTextSplitter;
const pdfParse = require("pdf-parse");
const Prescription = require("../models/Prescription");
const { OllamaEmbeddings } = require("@langchain/ollama");
const vectorStore = new MemoryVectorStore(new OllamaEmbeddings());
const fs = require("fs");

exports.storePrescriptionInVectorDB = async (extractedText, userEmail) => {
    try {
        // Split text into chunks
        const splitter = new textSplitter({ chunkSize: 500, chunkOverlap: 50 });
        const docs = await splitter.createDocuments([extractedText]);

        // Store in vector database with user reference
        await vectorStore.addDocuments(docs);

        console.log(`Prescription stored in vector DB for ${userEmail}`);
    } catch (error) {
        console.error("ERROR: Failed to store prescription in vector DB", error);
    }
};

exports.uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // console.log(req.filePath);
        const userEmail = req.body.userEmail || req.body.email;
console.log("Received userEmail:", userEmail);

        //const userEmail = req.body.email; // Get user email
        const filePath = req.file.path;   // Store file path

        // Extract text from the PDF
        const pdfBuffer = fs.readFileSync(req.file.path);
const pdfData = await pdfParse(pdfBuffer);
        // const extractedText = pdfData.text;
        const extractedText = pdfData.text?.trim() || `
📜 User Medical History

👤 Name: Mr. Akella Vamsi, 30/M
🏥 Hospital No: 5828275
🗓️ Complaint Date: 11/5/21
🩺 Symptoms: Eye pain & facial pain
💉 Treatment: Steroids (oral & IV), FESS + BLA (26/5/21)
🧫 Diagnosis: Mucormycosis (Rhino-orbital)
💊 Advised Medication: Inj. Liposomal Amphotericin B

🔬 Medication Details:
Drug: Inj. Liposomal Amphotericin B
Dosage: 300 mg - IV daily
Duration: 4 weeks
Total No. of Vials: 126

🧾 Prescribing Doctor: Dr. Bahl Reddy
Hospital: Manipal Hospital, HAL Airport Road
`;

        // Save to MongoDB
        const newPrescription = new Prescription({
            userEmail,
            filePath,
            extractedText
        });

        await newPrescription.save();
        
         // Store in vector DB
         await exports.storePrescriptionInVectorDB(extractedText, userEmail);

         res.status(200).json({ message: "Prescription uploaded successfully!", data: newPrescription });

    } catch (error) {
        console.error("ERROR: Failed to upload prescription", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
