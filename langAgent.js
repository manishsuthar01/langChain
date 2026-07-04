import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";

import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// export const llm = new ChatGroq({
//     apiKey: process.env.GROQ_API_KEY,
//     model: "llama-3.2-1b-preview",
//     temperature: 0,
// });

export const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0,
});

const contractSearchTool = tool(
    // async ({ query }) => {
    //     return `{
    //         clause_type: "termination",
    //         notice_period_days: 30,
    //         requires_written: true
    //     }`
    // },
    //  {
    //     name: "contract_search",
    //     description: "Search clauses and employee meta-data in contract database",
    //     schema: z.object({
    //         query: z.string()
    //     })
    // }

    async ({ query }) => {
        return JSON.stringify({
            contract_id: "CON-98721",
            parties: {
                employer: "Apex Tech Inc.",
                employee: "Jane Doe"
            },
            effective_date: "2024-01-15",
            tenure_months: 18, // Jane has worked for 1.5 years
            clauses: [
                {
                    type: "termination_by_employer",
                    standard_notice: "30 days",
                    extended_notice_rule: "If employee tenure is greater than 12 months, add 15 days of notice for every additional full year worked.",
                    requires_written: true,
                    delivery_method: "Certified Mail only",
                    severance: {
                        base: "2 weeks of salary",
                        multiplier: "1 additional week per full year of tenure",
                        max_limit: "8 weeks maximum"
                    }
                },
                {
                    type: "termination_by_employee",
                    standard_notice: "14 days",
                    requires_written: true,
                    delivery_method: "Email or Written Notice"
                },
                {
                    type: "immediate_termination_for_cause",
                    triggers: ["gross misconduct", "felony conviction", "material breach of contract"],
                    severance: "None"
                }
            ]
        });
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
const prompt = ['human', "Find termination clause"];

// let message = [prompt];
let messages = [
    new SystemMessage("You are a helpful assistant. Use tools to find information and answer the user's scenario by doing the calculations and applying rules exactly as stated in the contract data."),

    // Complex prompt:
    ['human', "Jane Doe is being terminated by her employer Apex Tech. Based on her start date and tenure, calculate exactly how many days of notice she must receive, how that notice must be delivered, and how many weeks of severance pay she is entitled to."]
];



while (true) {
    const response = await toolBoundLLM.invoke(messages)
    messages.push(response)

    if (!response.tool_calls?.length) {
        console.log(response.content);
        break;
    }

    const toolResult = await contractSearchTool.invoke(response.tool_calls[0].args)
    messages.push(toolResult)
}

// const result = await toolBoundLLM.invoke(message);
// console.log("Final LLM Response:", result);













// if (response.tool_calls.length) {
//     for (let toolCall of response.tool_calls) {
//         const result = await contractSearchTool.invoke(toolCall.args);
//         console.log(result);
//     }
// }