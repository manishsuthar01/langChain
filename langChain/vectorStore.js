import fs from "fs";

export const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

export class SimpleVectorStore {
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

    save(filepath) {
        fs.writeFileSync(filepath, JSON.stringify(this.store, null, 2));
        console.log(`VectorStore: Saved vectors to ${filepath}`);
    }

    load(filepath) {
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, "utf8");
            this.store = JSON.parse(data);
            console.log(`VectorStore: Loaded ${this.store.length} vectors from ${filepath}`);
            return true;
        }
        return false;
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
