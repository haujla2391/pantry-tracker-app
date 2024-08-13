import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
  You are a specialized AI suggestion bot designed to help users optimize the use of their kitchen inventory.
  Please provide practical meal ideas or cooking methods based on the available ingredients listed.
  If there are no suggestions, please specify what could be missing or how to improve the inventory.
`;

export async function POST(req) {
    try {
        const data = await req.json();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I'll act as the inventory suggestion bot with the given guidelines." }],
                },
                {
                    role: 'user',
                    parts: [{ text: data[0].content }], // Use the formatted string from the user
                },
            ],
        });

        // Get the response from the AI model
        const result = await chat.sendMessageStream([{ text: data[0].content }]);

        let fullResponse = "";
        for await (const chunk of result.stream) {
            const chunkText = await chunk.text();
            fullResponse += chunkText; // Accumulate the full response
        }

        // Return the full response as JSON
        return NextResponse.json({ suggestions: fullResponse.trim() || "No suggestions available." }); // Handle empty response
    } catch (error) {
        console.error("Error in POST route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

