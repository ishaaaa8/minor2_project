const { ChatOllama } = require("@langchain/ollama"); // ✅ Use local DeepSeek via Ollama
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { Document } = require("langchain/document");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const Prescription = require("../models/Prescription");
const MedicalForm = require("../models/MedicalForm"); // ✅ Ensure MedicalForm model is imported

// // Import the Ollama module
// const ollama = require('ollama');

// // Import the LangChain module
// const { OllamaEmbeddings } = require('langchain');



const fs = require("fs");
const path = require("path");

// 🔹 Initialize in-memory vector store (replace with Pinecone/Weaviate for production)
const vectorStore = new MemoryVectorStore(new OllamaEmbeddings());
// const { Client } = require("chromadb");
// const { OpenAIEmbeddings } = require("langchain/embeddings");
// const { Chroma } = require("langchain/vectorstores/chroma");

// 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



// // ✅ Initialize LLM using DeepSeek via Ollama
// const deepseek = new ChatOllama({
//     baseUrl: "http://localhost:11434",
//     model: "deepseek-r1:1.5b",
//     temperature: 0.7,
// });








const { ChatGroq } = require("@langchain/groq");
const groq = new ChatGroq({
    apiKey: "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", 
    model: "deepseek-r1-distill-llama-70b", 
    temperature: 0.7,
});


// ✅ Load general medical knowledge into vector store
// async function loadMedicalContext() {
//     const filePath = path.join(__dirname, "medical_data.txt");

//     let medicalText = "";
//     try {
//         medicalText = fs.readFileSync(filePath, "utf-8");
//         console.log("✅ Medical data loaded successfully!");
//     } catch (error) {
//         console.error("🔥 ERROR: Could not load medical_data.txt", error);
//         return null;
//     }

//     if (!medicalText) {
//         console.error("⚠️ ERROR: medical_data.txt is empty!");
//         return null;
//     }

//     const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
//     const documents = await textSplitter.createDocuments([medicalText]);

//     return await MemoryVectorStore.fromDocuments(documents, new OllamaEmbeddings());
// }

// Fetch & Store User Medical Data (Prescriptions + Medical Form) in Vector DB
async function getOllamaEmbeddings(textArray) {
    const allEmbeddings = [];
  
    for (const text of textArray) {
      const res = await Ollama.embeddings({
        model: "nomic-embed-text", // or "mxbai-embed-large"
        prompt: text,
      });
  
      allEmbeddings.push(res.embedding);
    }
  
    return allEmbeddings;
}

async function storeUserMedicalData(userEmail) {
    try {
        console.log(` Fetching medical data for ${userEmail}...`);
        
        // 🔹 Fetch prescriptions
        const userPrescriptions = await Prescription.find({ userEmail });
        
        // 🔹 Fetch medical form details
        const userMedicalForm = await MedicalForm.findOne({ userEmail });

        if (!userPrescriptions.length && !userMedicalForm) {
            console.warn(`⚠️ No medical records found for ${userEmail}.`);
            return null;
        }

        // 🔹 Extract & format prescription details
        const prescriptionText = userPrescriptions.length 
            ? userPrescriptions.map(p => p.extractedText).join("\n") 
            : "No prescriptions found.";

        // 🔹 Extract & format medical form details
        const medicalFormText = userMedicalForm 
            ? ` **Patient Name:** ${userMedicalForm.name}\n **Age:** ${userMedicalForm.age}\n **Allergies:** ${userMedicalForm.allergies}\n **Conditions:** ${userMedicalForm.conditions}\n **Medications:** ${userMedicalForm.medications}`
            : "No medical form details available.";

        // 🔹 Combine both into structured history
        const userMedicalHistory = `📜 **User Medical History**\n\n📝 **Prescriptions:**\n${prescriptionText}\n\n📄 **Medical Form Details:**\n${medicalFormText}`;
        
        console.log("📄 Compiled User Medical History:\n", userMedicalHistory);

        // 🔹 Split text into chunks
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
        const docs = await splitter.createDocuments([userMedicalHistory]);

        // 🔹 Store in vector database
        await vectorStore.addDocuments(docs);
        console.log(`✅ User medical data stored in vector DB for ${userEmail}`);



        // const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
        // const textChunks = await splitter.createDocuments([userMedicalHistory]);

        // const embeddings = await getOllamaEmbeddings(textChunks.map(chunk => chunk.pageContent));

        // // Attach embeddings to documents
        // const documentsWithEmbeddings = textChunks.map((chunk, i) => ({
        // id: `${userEmail}-chunk-${i}`,
        // metadata: { userEmail },
        // embedding: embeddings[i],
        // document: chunk.pageContent,
        // }));

        // // Add to Chroma collection manually using Chroma client
        // await collection.add({
        // ids: documentsWithEmbeddings.map(d => d.id),
        // metadatas: documentsWithEmbeddings.map(d => d.metadata),
        // embeddings: documentsWithEmbeddings.map(d => d.embedding),
        // documents: documentsWithEmbeddings.map(d => d.document),
        // });

        // const vectorStore = new Chroma(collection, chromaClient);

        return { vectorStore, userMedicalHistory };

    } catch (error) {
        console.error(`🔥 ERROR: Failed to store user medical data in vector DB for ${userEmail}`, error);
        return null;
    }
}

// ✅ Get Medical Response
async function getMedicalResponse(userEmail, userInput) {
    try {
        console.log("🚀 Loading medical context...");

        // 🔹 Store user medical data in vector DB
        const userData = await storeUserMedicalData(userEmail);
        if (!userData) {
            return "⚠️ No medical history found. Please upload your medical details.";
        }

        const { vectorStore, userMedicalHistory } = userData;

        // 🔹 Retrieve relevant documents
        const retriever = vectorStore.asRetriever({ k: 5 });

        console.log("✅ Retriever initialized!");

        // 🔹 Create retrieval chain
        console.log("🚀 Creating retrieval chain...");
        let retrievalChain;

        try {
            retrievalChain = await createRetrievalChain({
                combineDocsChain: await createStuffDocumentsChain({
                    // llm: deepseek,
                    llm: groq,
                    prompt: ChatPromptTemplate.fromTemplate(`
                        You are MedBot, a **highly intelligent AI medical assistant**. Your goal is to provide **medically accurate, highly personalized responses** based on:
                        
                        - **The user's retrieved medical history** (prescriptions, conditions, allergies, medications).
                        - **Relevant medical knowledge**.
                        
                        📌 **Instructions:**
                        1️⃣ Analyze the **user's medical history**.
                        2️⃣ Understand the **current query**.
                        3️⃣ If the query relates to health, **tailor your response using their history**.
                        4️⃣ Offer **clear explanations and actionable advice**.
                        5️⃣ If the query is general, respond normally.

                        🔹 **User's Medical History:**
                        {user_info}

                        🔹 **Retrieved Medical Knowledge:**
                        {context}

                        📝 **User's Query:**
                        {input}

                        🏥 **MedBot's Response:**
                    `),
                }),
                retriever: retriever,
            });
        } catch (error) {
            console.error("🔥 ERROR: Retrieval chain creation failed!", error);
            return "⚠️ Retrieval chain creation failed. Please try again later.";
        }

        console.log("✅ Retrieval chain created successfully!");

        try {
            console.log("🚀 Invoking retrieval chain...");
            const response = await retrievalChain.invoke({
                user_info: userMedicalHistory, // ✅ Pass actual user history
                input: userInput,
            });

            console.log("✅ Response received:", response);
            return response.answer;

        } catch (error) {
            console.error("🔥 ERROR: Retrieval chain invocation failed!", error);
            return "⚠️ An error occurred while generating the response.";
        }

    } catch (error) {
        console.error("🔥 ERROR: General error in getMedicalResponse", error);
        return "⚠️ An unexpected error occurred.";
    }
}

module.exports = { getMedicalResponse };



















// const { ChatOllama } = require("@langchain/ollama"); // ✅ Use local DeepSeek via Ollama
// const { ChatPromptTemplate } = require("@langchain/core/prompts");
// const { Document } = require("langchain/document");
// const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
// const { createRetrievalChain } = require("langchain/chains/retrieval");
// const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
// const { OllamaEmbeddings } = require("@langchain/ollama");
// const { MemoryVectorStore } = require("langchain/vectorstores/memory");
// const { StringOutputParser } = require("@langchain/core/output_parsers");
// const Prescription = require("../models/Prescription");

// const fs = require("fs");
// const path = require("path");

// // 🔹 Initialize in-memory vector store (replace with Pinecone/Weaviate for production)
// const vectorStore = new MemoryVectorStore(new OllamaEmbeddings());

// // ✅ Ensure LLM is initialized using Ollama
// const deepseek = new ChatOllama({
//     baseUrl: "http://localhost:11434", // ✅ Local Ollama Server
//     model: "deepseek-r1:1.5b", // ✅ Make sure this model is pulled in Ollama
//     temperature: 0.7,
// });

// // ✅ Global Prompt Template (Avoid Repeating)
// // const prompt = ChatPromptTemplate.fromTemplate(`
// // You are MedBot, an AI medical assistant. Use the retrieved medical knowledge to answer user queries with accuracy.

// // If the user asks something medical, retrieve relevant medical information and respond. Otherwise, generate a general answer.

// // Retrieved Context:
// // {context}

// // User Query:
// // {input}

// // AI Response:
// // `);

// const prompt = ChatPromptTemplate.fromTemplate(`
//     You are MedBot, a highly intelligent AI medical assistant. Your goal is to provide medically accurate, **highly personalized responses** based on the user's **retrieved medical history** and general medical knowledge.
    
//     🔹 **User's Medical History:**
//     {user_info}
    
//     🔹 **Retrieved Context (Medical Knowledge):**
//     {context}
    
//     📌 **Task:** 
//     1️⃣ Analyze the user's **retrieved medical history**.
//     2️⃣ Understand the user's **current query**.
//     3️⃣ If the query relates to medical conditions, **provide a highly personalized response**.
//     4️⃣ Offer a **clear explanation** for the advice given.
    
//     📝 **User's Query:**
//     {input}
    
//     🩺 **MedBot's Response:**
//     `);

// // ✅ Load medical knowledge into a vector store (Memory-based)
// async function loadMedicalContext() {
//     const filePath = path.join(__dirname, "medical_data.txt");

//     let medicalText = ""; // ✅ Define outside try-catch to ensure function scope

//     try {
//         medicalText = fs.readFileSync(filePath, "utf-8"); // ✅ Correct path
//         console.log("✅ Medical data loaded successfully!");
//     } catch (error) {
//         console.error("🔥 ERROR: Could not load medical_data.txt", error);
//         return null; // Return null if loading fails
//     }

//     if (!medicalText) {
//         console.error("⚠️ ERROR: medical_data.txt is empty!");
//         return null;
//     }

//     const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
//     const documents = await textSplitter.createDocuments([medicalText]);

//     const vectorStore = await MemoryVectorStore.fromDocuments(documents, new OllamaEmbeddings());
//     return vectorStore;
// }




// // ✅ Store Prescription Text in Vector Database
// async function storePrescriptionInVectorDB(userEmail) {
//     try {
//         console.log(`🚀 Fetching prescriptions for ${userEmail}...`);
//         const userPrescriptions = await Prescription.find({ userEmail });

//         if (!userPrescriptions.length) {
//             console.warn(`⚠️ No medical records found for ${userEmail}.`);
//             return null;
//         }

//         // Combine extracted text from multiple prescriptions
//         let combinedText = userPrescriptions.map(p => p.extractedText).join("\n");
        
//         console.log(`📄 Extracted Text: \n${combinedText.substring(0, 500)}...`); // Log first 500 chars

//         // Split text into chunks
//         const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
//         const docs = await splitter.createDocuments([combinedText]);

//         // Store in vector database
//         await vectorStore.addDocuments(docs);
//         console.log(`✅ Prescription text stored in vector DB for ${userEmail}`);

//         return vectorStore;

//     } catch (error) {
//         console.error(`🔥 ERROR: Failed to store prescription in vector DB for ${userEmail}`, error);
//         return null;
//     }
// }


// // ✅ Get Medical Response
// async function getMedicalResponse(userEmail, userInput) {
//     try {
//         console.log("🚀 Loading medical context...");

//         // 🔹 Store user prescriptions in vector DB
//         const vectorStore = await storePrescriptionInVectorDB(userEmail);

//         if (!vectorStore) {
//             console.error("⚠️ ERROR: Vector store could not be created.");
//             return "⚠️ No medical history found. Please upload a prescription.";
//         }

//         // 🔹 Retrieve relevant docs
//         const retriever = vectorStore.asRetriever(
//             {
//                 k: 5,  // Retrieve more documents
//                 relevanceScoreFn: (doc) => {
//                     if (doc.metadata.source === "prescription") return 1.0; // Prioritize prescriptions
//                     return 0.5; // Lower priority for general medical info
//                 },
//             }
//         );
//         if (!retriever) {
//             console.error("⚠️ ERROR: Retriever initialization failed!");
//             return "⚠️ Retrieval failed. Try again later.";
//         }

//         console.log("✅ Retriever initialized!");

//         console.log("🚀 Creating retrieval chain...");
//         let retrievalChain;

//         try {
//             retrievalChain = await createRetrievalChain({
//                 combineDocsChain: await createStuffDocumentsChain({
//                     llm: deepseek,
//                     prompt: ChatPromptTemplate.fromTemplate(`
//                         You are MedBot, a highly intelligent AI medical assistant. Your goal is to provide medically accurate, **highly personalized responses** based on the user's **retrieved medical history** and general medical knowledge.

//                                 🔹 **User's Medical History:**
//                                 {user_info}

//                                 🔹 **Retrieved Context (Medical Knowledge):**
//                                 {context}

//                                 📌 **Task:** 
//                                 1️⃣ Analyze the user's **retrieved medical history**.
//                                 2️⃣ Understand the user's **current query**.
//                                 3️⃣ If the query relates to medical conditions, **provide a highly personalized response**.
//                                 4️⃣ Offer a **clear explanation** for the advice given.

//                                 📝 **User's Query:**
//                                 {input}

//                                 🩺 **MedBot's Response:**
//                     `),
//                 }),
//                 retriever: retriever,
//             });
//         } catch (error) {
//             console.error("🔥 ERROR: Retrieval chain creation failed!", error);
//             return "⚠️ Retrieval chain creation failed. Please check the logs.";
//         }

//         console.log("✅ Retrieval chain created successfully!");

//         try {
//             console.log("🚀 Invoking retrieval chain...");
//             const response = await retrievalChain.invoke({
//                 user_info: `Medical history for ${userEmail}`, // Placeholder
//                 input: userInput,  // User's query
//             });

//             console.log("✅ Response received:", response);
//             return response.answer;

//         } catch (error) {
//             console.error("🔥 ERROR: Retrieval chain invocation failed!", error);
//             return "⚠️ An error occurred while generating the response.";
//         }

//     } catch (error) {
//         console.error("🔥 ERROR: General error in getMedicalResponse", error);
//         return "⚠️ An unexpected error occurred.";
//     }
// }

// module.exports = { getMedicalResponse };
