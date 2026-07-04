import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenAI } from "@langchain/google-genai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";

dotenv.config();

// export const llm = new ChatGroq({
//     apiKey: process.env.GROQ_API_KEY,
//     model: "llama-3.1-8b-instant",
//     temperature: 0,
// })


export const llm = new ChatGoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash", // Use 2.5 Flash
    temperature: 0,
});


const prompt = ChatPromptTemplate.fromTemplate(`
       You are a legal contract analyzer.
       
       Analyze clause:
       {clause}
       
       Provide:
       1. Clause type
       2. Risks
       3. Recommendations
`);

export const outputParser = new StringOutputParser();

export const chain = prompt.pipe(llm).pipe(outputParser);

const result = await chain.invoke({
    clause: "Employer may terminate without notice."
})

console.log(result);