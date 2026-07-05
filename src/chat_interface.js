import readline from "readline"
import { askQuestion } from "./langAgent.js"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function AskUser(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve)
    })
}

async function main() {
    console.log("Type 'exit' to quit.");
    while (true) {
        let userQuestion = await AskUser("You: ");

        if (userQuestion.trim().toLowerCase() === "exit") {
            break;
        }

        if (!userQuestion.trim()) {
            console.log("Please enter a question.");
            continue;
        }

        try {
            const response = await askQuestion(userQuestion, (chunk) => {
                process.stdout.write(chunk)
            });
        } catch (error) {
            console.error("An error occurred:", error.message);
        }
        process.stdout.write("\n")
    }
    rl.close();
}
main();
