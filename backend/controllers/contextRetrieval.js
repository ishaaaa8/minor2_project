const { RecursiveCharacterTextSplitter } = require("@langchain/text_splitter");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { MemoryVectorStore } = require("@langchain/vectorstores/memory");
const MedicalContext = require("../Models/MedicalContext"); // Mongoose model for storing documents

async function loadMedicalContext() {
    try {
        const contextDocs = await MedicalContext.find(); // Fetch medical records from MongoDB

        if (!contextDocs.length) {
            throw new Error("No medical context found in database.");
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        });

        const documents = contextDocs.map(doc => doc.content);
        const splitDocs = await textSplitter.splitDocuments(documents);

        const embeddings = new OllamaEmbeddings({
            model: "deepseek-embeddings", 
            temperature: 0.5,
        });

        const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
        return vectorStore;
    } catch (error) {
        console.error("Error loading medical context:", error);
    }
}

module.exports = { loadMedicalContext };
