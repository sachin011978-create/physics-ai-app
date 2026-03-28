import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors({
  origin: '*', // Allows any device (mobile/desktop) to connect
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Handles preflight requests for mobile browsers
app.get('/health', (req, res) => res.send('OK'));
app.use(express.json());

let genAI = null;
if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch(e) { console.error("Gemini Init Error:", e); }
} else {
    console.warn("⚠️ CRITICAL: GEMINI_API_KEY is missing from environment. Server will stay alive but API calls will fail gracefully.");
}

app.post("/ask", async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ answer: "⚠️ Backend Error: GEMINI_API_KEY is completely missing in your Render Dashboard! Please explicitly add it in the Environment Variables tab on Render, and refresh the app." });
        }

        const { prompt } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Backend Error Details:", error);
        res.status(500).json({ answer: "AI Error: Please check backend console." });
    }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));