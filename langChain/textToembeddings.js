import path from "path";
import { docs } from "./textSpliter.js";
import { embeddings } from "./embeddings.js";
import { SimpleVectorStore } from "./vectorStore.js";

const STORE_PATH = path.join(process.cwd(), "embeddings.json");

const vectorStore = new SimpleVectorStore(embeddings);

if (!vectorStore.load(STORE_PATH)) {
    console.log("No existing embeddings found, generating new ones...");
    await vectorStore.addTexts(docs);
    vectorStore.save(STORE_PATH);
}

export async function constractSearch(query) {
    const topK = 2;
    const searchResults = await vectorStore.similaritySearch(query, topK);
    return searchResults.map(doc => ({
        content: doc.content,
        metadata: doc.metadata,
        similarity: doc.similarity
    }));
}
