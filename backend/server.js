const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");  // Import MongoDB connection function
const authRoutes = require("./routes/authRoutes");
const medicalRoutes = require("./routes/medicalRoutes");

const chatRoutes = require("./routes/chatRoutes");


dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/medical", medicalRoutes); 
app.use("/api/chat", chatRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
