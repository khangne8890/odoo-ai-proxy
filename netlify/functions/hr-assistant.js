JavaScript
const fetch = require('node-fetch');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Key is secure here!
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*", // Allows Odoo domain to access
    "Access-Control-Allow-Headers": "Content-Type"
};

exports.handler = async (event) => {
    // Handle CORS Preflight request (OPTIONS method)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: CORS_HEADERS, body: "Method Not Allowed" };
    }

    try {
        const { user_query } = JSON.parse(event.body);

        if (!user_query) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing user_query" }) };
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a professional Human Resources assistant, providing concise and accurate information about company policies, hiring, and employee benefits in English." 
                    },
                    { role: "user", content: user_query }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return { 
                statusCode: response.status || 500, 
                headers: CORS_HEADERS, 
                body: JSON.stringify({ error: "OpenAI API Error: " + data.error.message }) 
            };
        }

        const aiText = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ ai_response: aiText })
        };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal Server Error." }) };
    }
};
