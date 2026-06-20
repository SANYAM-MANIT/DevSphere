const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE (Now completely safe from external API errors)
app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("<h1>DevSphere Backend with Gemini AI is Running 🚀</h1>");
});

// REAL AI CHAT ROUTE
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    // Safety check if the key isn't loaded
    if (!process.env.GEMINI_API_KEY) {
        return res.json({ reply: "Backend error: GEMINI_API_KEY is missing from your .env file." });
    }

    try {
        // 1. Cleaner REST URL without the key appended to the end
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        // 2. Send the request with the key placed in the headers config
        const response = await axios.post(
            url,
            {
                contents: [
                    {
                        parts: [
                            { text: userMessage }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY // <-- The new secure way Google wants it!
                }
            }
        );

        // 3. Send back the response text
        if (response.data && response.data.candidates && response.data.candidates[0].content.parts[0]) {
            const aiReply = response.data.candidates[0].content.parts[0].text;
            res.json({ reply: aiReply });
        } else {
            res.json({ reply: "I connected, but the brain returned empty data. Try again!" });
        }

    } catch (error) {
        console.error("Gemini Error Status:", error.response ? error.response.status : "No Status");
        console.error("Gemini Error Data:", error.response ? error.response.data : error.message);
        res.json({ reply: "AI connection error ❌ Check terminal for the Google response details." });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});