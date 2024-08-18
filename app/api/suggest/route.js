import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure you have your OpenAI API key in your environment variables
});

const systemPrompt = `
  You are a specialized AI suggestion bot designed to help users optimize the use of their kitchen inventory.
  Please provide practical meal ideas or cooking methods based on the available ingredients listed.
  If there are no suggestions, please specify what could be missing or how to improve the inventory.
`;

export async function POST(req) {
    try {
        const data = await req.json();

        // Create the prompt to send to OpenAI
        const prompt = `${systemPrompt}\n\nUser's ingredients: ${data[0].content}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4", // Specify the model you want to use (e.g., gpt-4, gpt-3.5-turbo)
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: data[0].content },
            ],
            stream: true, // If you want streaming responses
        });

        let fullResponse = "";
        for await (const chunk of response) {
            const chunkText = chunk.choices[0].delta?.content || "";
            fullResponse += chunkText; // Accumulate the full response
        }

        // Return the full response as JSON
        return NextResponse.json({ suggestions: fullResponse.trim() || "No suggestions available." }); // Handle empty response
    } catch (error) {
        console.error("Error in POST route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
