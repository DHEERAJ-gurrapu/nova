import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------------------------
// Middleware
// ----------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------
// Debug
// ----------------------------

console.log("=================================");
console.log("Project Folder:", __dirname);
console.log(
    "Face Exists:",
    fs.existsSync(path.join(__dirname, "public", "face.html"))
);
console.log("=================================");

// ----------------------------
// Home Page
// ----------------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "face.html"));
});

// ----------------------------
// Groq Client
// ----------------------------

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// ----------------------------
// Nova Conversation Memory
// ----------------------------

let conversationHistory = [
    {
        role: "system",
        content: `You are Nova.

You are a futuristic AI assistant inspired by JARVIS.

Rules:
- Your name is Nova.
- Never say you are ChatGPT.
- Never mention Persona-X.
- Be intelligent.
- Be calm.
- Be confident.
- Speak naturally.
- Keep replies under 80 words unless asked for more detail.
- Remember previous parts of this conversation.
- If someone asks your name, say "I'm Nova."
- If you don't know something, admit it honestly.`
    }
];

// ----------------------------
// Ask Nova
// ----------------------------

async function askNova(question) {

    conversationHistory.push({
        role: "user",
        content: question
    });

    // Keep system prompt + last 10 messages
    if (conversationHistory.length > 11) {
        conversationHistory.splice(1, 2);
    }

    const response = await client.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: conversationHistory
    });

    const answer = response.choices[0].message.content;

    conversationHistory.push({
        role: "assistant",
        content: answer
    });

    return answer;
}

// ----------------------------
// AI Route
// ----------------------------

app.post("/ask", async (req, res) => {

    try {

        const question = req.body.question?.trim();

        if (!question) {
            return res.status(400).json({
                answer: "I didn't hear anything."
            });
        }

        console.log("");
        console.log("🎤 User:", question);

        const answer = await askNova(question);

        console.log("🤖 Nova:", answer);
        console.log("");

        res.json({
            answer
        });

    } catch (error) {

        console.error("Groq Error:");
        console.error(error);

        res.status(500).json({
            answer: "Sorry, I'm having trouble connecting right now."
        });

    }

});

// ----------------------------
// Health Check
// ----------------------------

app.get("/test", (req, res) => {
    res.send("Nova is Online.");
});

// ----------------------------
// Reset Memory
// ----------------------------

app.post("/reset", (req, res) => {

    conversationHistory = [
        {
            role: "system",
            content: `You are Nova.

You are a futuristic AI assistant inspired by JARVIS.

Rules:
- Your name is Nova.
- Never say you are ChatGPT.
- Never mention Persona-X.
- Be intelligent.
- Be calm.
- Be confident.
- Speak naturally.
- Keep replies under 80 words unless asked for more detail.
- Remember previous parts of this conversation.
- If someone asks your name, say "I'm Nova."
- If you don't know something, admit it honestly.`
        }
    ];

    console.log("🧠 Memory Cleared");

    res.json({
        success: true
    });

});

// ----------------------------
// 404
// ----------------------------

app.use((req, res) => {
    res.status(404).send("404 - Not Found");
});

// ----------------------------
// Start Server
// ----------------------------

const PORT = 3000;

app.listen(PORT, () => {

    console.log("");
    console.log("==================================");
    console.log("🤖 NOVA ONLINE");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("🧠 Conversation Memory Enabled");
    console.log("==================================");
    console.log("");

});