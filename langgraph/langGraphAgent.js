import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { constractSearch } from "../langChain/textToembeddings.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

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

const checkpointer = new MemorySaver();

const agent = createReactAgent({
    llm,
    tools: [contractSearchTool],
    messageModifier: "You are ContractBot, a specialized AI assistant designed to help with HR and contract analysis. Use tools to find information and answer the user's scenario by doing the calculations and applying rules exactly as stated in the contract data.",
    checkpointSaver: checkpointer
});

export async function askQuestion(userQuestion, onChunk) {
    // invoke() runs the entire graph to completion and returns the final state
    const responseState = await agent.invoke(
        { messages: [new HumanMessage(userQuestion)] },
        { configurable: { thread_id: "conversation-1" } }
    );
    console.log("\n")
    console.log(responseState)

    // The final state contains the entire conversation history.
    // The very last message is the AI's final text response.
    const finalMessage = responseState.messages[responseState.messages.length - 1];

    let fullResponse = "";
    if (typeof finalMessage.content === "string") {
        fullResponse = finalMessage.content;
    } else if (Array.isArray(finalMessage.content)) {
        fullResponse = finalMessage.content.map(block => block.text || "").join("");
    }

    // We call onChunk once with the full response so your chat_interface.js still works
    if (onChunk && fullResponse) {
        onChunk(fullResponse);
    }

    return fullResponse;
}
