import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { constractSearch } from "./textToembeddings.js";

// export const llm = new ChatGroq({
//     apiKey: process.env.GROQ_API_KEY,
//     model: "llama-3.3-70b-versatile",
//     temperature: 0,
// });

export const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0,
});

const contractSearchTool = tool(
    async ({ query }) => {
        const contract = await constractSearch(query);
        return JSON.stringify(contract);
    },
    {
        name: "contract_search",
        description: "Search clauses and employee meta-data in contract database",
        schema: z.object({
            query: z.string()
        })
    }

);



const toolBoundLLM = llm.bindTools([contractSearchTool])

let messages = [
    new SystemMessage("You are ContractBot, a specialized AI assistant designed to help with HR and contract analysis. Use tools to find information and answer the user's scenario by doing the calculations and applying rules exactly as stated in the contract data."),
];


export async function askQuestion(userQestion, onChunk) {
    messages.push(['human', userQestion])
    while (true) {
        let calledTools = false;
        let aiToolCalls;

        const response = await toolBoundLLM.stream(messages)
        let fullResponse = ""
        for await (const chunk of response) {
            let chunkText = "";
            if (typeof chunk.content === "string") {
                chunkText = chunk.content;
            } else if (Array.isArray(chunk.content)) {
                // If Gemini wraps the text in an array, extract it
                chunkText = chunk.content.map(block => block.text || "").join("");
            }
            if (chunkText) {
                onChunk(chunkText);
                fullResponse += chunkText
            }

            if (chunk.tool_calls?.length) {
                console.log("LLM wants to use tool: ", chunk.tool_calls[0].name);
                calledTools = true;
                aiToolCalls = chunk.tool_calls[0]
            }
        }
        messages.push({
            role: "assistant",
            content: fullResponse,
            tool_calls: aiToolCalls ? [aiToolCalls] : []
        });
        // console.log(messages)

        if (calledTools === false) {
            return fullResponse;
        }

        if (aiToolCalls) {
            console.log("Tool called by LLM: ", aiToolCalls.args);
            const toolResult = await contractSearchTool.invoke(aiToolCalls.args);
            // console.log(toolResult)
            messages.push(new ToolMessage({
                tool_call_id: aiToolCalls.id,
                content: toolResult,
                name: aiToolCalls.name,
                role: "tool"
            }));
        }
    }

}
