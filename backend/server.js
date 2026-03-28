import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const app = express();

// Universal CORS with explicit preflight handling
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// Load Gemini gracefully
let genAI = null;
if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch(e) { console.error("Gemini Init Error:", e); }
} else {
    console.warn("⚠️ CRITICAL: GEMINI_API_KEY is missing from environment.");
}

// Standard Render health check
app.get('/health', (req, res) => res.send('OK'));

// Core Interaction Endpoint
app.post("/ask", async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ answer: "⚠️ Backend Error: GEMINI_API_KEY is explicitly missing from Render!" });
        }

        const { input, level } = req.body;
        if (!input) return res.status(400).json({ answer: "⚠️ No question provided." });

        // Build the dynamic instruction on the backend payload perfectly
        const basePersona = "You are an expert Physics Teacher for a student named Vivan. Explain 11th-12th grade Physics using simple real-life examples, home experiments, and a mix of Marathi and English.";
        let diffText = "Use standard definitions.";
        if (level === "Easy") diffText = "Focus on stories and very simple Marathi.";
        if (level === "Hard") diffText = "Include formulas and numerical hints.";

        const finalPrompt = `System Instruction: ${basePersona} Difficulty modifier: ${diffText}\n\nQuestion: ${input}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(finalPrompt);
        const text = result.response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Ask Error:", error);
        res.status(500).json({ answer: "AI Error: The Cyber-Physics mainframe is overloaded." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));