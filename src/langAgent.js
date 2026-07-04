import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { constractSearch } from "./textToembeddings.js";

export const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
});

// export const llm = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     model: "gemini-2.5-flash",
//     temperature: 0,
// });

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


export async function askQuestion(userQestion) {

    messages.push(['human', userQestion])
    while (true) {
        const response = await toolBoundLLM.invoke(messages)
        messages.push(response)

        if (!response.tool_calls?.length) {
            return response.content;
        }

        const toolResult = await contractSearchTool.invoke(response.tool_calls[0]);
        messages.push(toolResult);
    }

}









// JSON.stringify({
//             contract_id: "CON-98721",
//             parties: {
//                 employer: "Apex Tech Inc.",
//                 employee: "Jane Doe"
//             },
//             effective_date: "2024-01-15",
//             tenure_months: 18,
//             clauses: [
//                 {
//                     type: "termination_by_employer",
//                     standard_notice: "30 days",
//                     extended_notice_rule: "If employee tenure is greater than 12 months, add 15 days of notice for every additional full year worked.",
//                     requires_written: true,
//                     delivery_method: "Certified Mail only",
//                     severance: {
//                         base: "2 weeks of salary",
//                         multiplier: "1 additional week per full year of tenure",
//                         max_limit: "8 weeks maximum"
//                     }
//                 },
//                 {
//                     type: "termination_by_employee",
//                     standard_notice: "14 days",
//                     requires_written: true,
//                     delivery_method: "Email or Written Notice"
//                 },
//                 {
//                     type: "immediate_termination_for_cause",
//                     triggers: ["gross misconduct", "felony conviction", "material breach of contract"],
//                     severance: "None"
//                 }
//             ]
//         });
//     },