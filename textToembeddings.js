import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import dotenv from "dotenv";
dotenv.config();

import { docs } from "./textSpliter.js"

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001",
});

// const textsToEmbed = [
//     "LangChain is a framework for developing applications powered by language models.",
//     "Vector embeddings are numerical representations of text.",
//     "The sky is blue."
// ];

const query = "What penalty applies for late invoice payments?"

const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};


class SimpleVectorStore {
    constructor(embeddingsModel) {
        this.embeddingsModel = embeddingsModel;
        this.store = [];
    }

    async addTexts(docs) {
        console.log(`VectorStore: Generating embeddings for ${docs.length} documents...`);
        const embeddings = await this.embeddingsModel.embedDocuments(docs.map(d => d.pageContent));

        for (let i = 0; i < docs.length; i++) {
            this.store.push({
                content: docs[i].pageContent,
                embedding: embeddings[i],
                metadata: docs[i].metadata
            });
        }
        console.log(`VectorStore: Stored ${docs.length} vectors!`);
    }

    async similaritySearch(query, k = 4) {
        const queryEmbedding = await this.embeddingsModel.embedQuery(query);

        const results = this.store.map(doc => ({
            ...doc,
            similarity: cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        // Sort by similarity descending and return top K
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, k);
    }
}

// 1. Create our Vector Store and add our texts
const vectorStore = new SimpleVectorStore(embeddings);
await vectorStore.addTexts(docs);

// 2. Perform a Similarity Search
const topK = 2;
const searchResults = await vectorStore.similaritySearch(query, topK);
// console.log(searchResults)

console.log(`\nTop ${topK} most similar documents to "${query}":`);
searchResults.forEach((doc, index) => {
    console.log(`\nRank ${index + 1} (Score: ${doc.similarity.toFixed(4)}):`);
    console.log(`Content: "${doc.content}"`);
    console.log(`Metadata:`, doc.metadata);
});











// console.log("\nCalculating similarity between documents...");
// console.log("Similarity between doc 1 and doc 2:", cosineSimilarity(documentEmbeddings[0], documentEmbeddings[1]));
// console.log("Similarity between doc 1 and doc 3:", cosineSimilarity(documentEmbeddings[0], documentEmbeddings[2]));


// console.log("\nCalculating similarity between query and documents...");
// console.log("Similarity between query and doc 1:", cosineSimilarity(queryEmbeddings, documentEmbeddings[0]));
// console.log("Similarity between query and doc 2:", cosineSimilarity(queryEmbeddings, documentEmbeddings[1]));
// console.log("Similarity between query and doc 3:", cosineSimilarity(queryEmbeddings, documentEmbeddings[2]));
