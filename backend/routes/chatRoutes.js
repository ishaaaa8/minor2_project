const express = require("express");
const router = express.Router();
const { getMedicalResponse } = require("../controllers/ragChatbot"); // Import function
const { SummarizerManager } = require("node-summarizer");

// ✅ Chatbot query route
router.post("/", async (req, res) => {
    try {
        const { userEmail, query } = req.body; // Get user email & query

        if (!userEmail || !query) {
            return res.status(400).json({ error: "User email and query are required." });
        }

        console.log(`📩 New Chat Query from ${userEmail}: ${query}`);

        const response = await getMedicalResponse(userEmail, query); // Get AI response

        // Summarize the query
        const querySummarizer = new SummarizerManager(query, 1);
        const querySummary = querySummarizer.getSummaryByFrequency().summary;

        // Summarize the response
        const responseSummarizer = new SummarizerManager(response, 1);
        const responseSummary = responseSummarizer.getSummaryByFrequency().summary;

        console.log(`📝 Summary for ${userEmail}:\n- Query: ${querySummary}\n- Response: ${responseSummary}`);

        res.json({ answer: response });

    } catch (error) {
        console.error("🔥 ERROR: Chatbot processing failed!", error);
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
});

module.exports = router;
