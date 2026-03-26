import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config({ path: '../.env' });

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

let globalPdfPages = [];
const pdfPath = "../public/physicsbook.pdf";

if (fs.existsSync(pdfPath)) {
    console.log("Loading global PDF into memory...");
    const dataBuffer = fs.readFileSync(pdfPath);
    const render_page = function(pageData) {
        return pageData.getTextContent().then(function(textContent) {
            let text = '';
            for (let item of textContent.items) {
                text += item.str + ' ';
            }
            return text + "\n---PAGE_SEPARATOR---\n";
        });
    };
    pdfParse(dataBuffer, { pagerender: render_page }).then(data => {
        globalPdfPages = data.text.split("\n---PAGE_SEPARATOR---\n");
        console.log(`Global PDF Loaded successfully! Total pages: ${globalPdfPages.length}`);
    }).catch(err => console.error("PDF Parse Error:", err));
}

let genAI = null;
let fileManager = null;
if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    } catch(e) { console.error("Gemini Init Error:", e); }
} else {
    console.warn("⚠️ CRITICAL: GEMINI_API_KEY is missing from environment. Server will stay alive but API calls will fail gracefully.");
}

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!fileManager) {
            return res.status(500).json({ error: "API Key missing in Deployment Environment" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        // Rename file to have .pdf extension for the browser iframe
        const newPath = req.file.path + '.pdf';
        fs.renameSync(req.file.path, newPath);

        // Upload to Gemini
        const uploadResponse = await fileManager.uploadFile(newPath, {
            mimeType: "application/pdf",
            displayName: req.file.originalname,
        });
        
        // Return local URL to serve PDF in iframe
        res.json({ 
            fileUri: uploadResponse.file.uri, 
            localUrl: `http://localhost:3000/uploads/${req.file.filename}.pdf`
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

app.post("/ask", async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ answer: "⚠️ Backend Error: GEMINI_API_KEY is completely missing in your Render Dashboard! Please explicitly add it in the Environment Variables tab on Render, and refresh the app." });
        }

        const { prompt, fileUri, chapterStartPage, chapterEndPage } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        let requestContent = prompt;
        if (fileUri) {
            requestContent = [{ fileData: { mimeType: "application/pdf", fileUri } }, { text: prompt }];
        } else if (chapterStartPage && globalPdfPages.length > 0) {
            const start = Math.max(0, chapterStartPage - 1);
            const end = chapterEndPage ? Math.min(globalPdfPages.length, chapterEndPage) : start + 1;
            const contextText = globalPdfPages.slice(start, end).join("\n");
            requestContent = `Extracted Book Context:\n${contextText}\n\nTask:\n${prompt}`;
        }

        const result = await model.generateContent(requestContent);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Backend Error Details:", error);
        res.status(500).json({ answer: "AI Error: Please check backend console." });
    }
});

app.post("/extract-page", (req, res) => {
    try {
        const { page } = req.body;
        if (globalPdfPages.length > 0) {
            const text = globalPdfPages[Math.max(0, page - 1)] || "Page content not found.";
            res.json({ text: text.trim().substring(0, 1500) }); // Send first 1500 chars to avoid memory overload in synth
        } else {
            res.status(500).json({ text: "Global PDF memory not loaded." });
        }
    } catch (err) {
        res.status(500).json({ text: "Error extracting page text." });
    }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));