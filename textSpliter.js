import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";

// const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 100
// });
function splitLegalDocument(text) {
    return text.split(/(?=SECTION \d+ —)/g);
}


const text = fs.readFileSync("./clause.txt", 'utf-8');
export const docs = splitLegalDocument(text).map((section, index) => ({
    pageContent: section,
    metadata: {
        sectionId: index + 1
    }
}));

console.log(`Created ${docs.length} documents!`);

// // Use createDocuments when passing raw strings!
// export const docs = await splitter.createDocuments([text]);
// console.log(`Created ${docs.length} documents!`);
