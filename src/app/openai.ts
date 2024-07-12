"use server";

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getC3POResponse(question: string) {
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "you are a simple chatbot. You will be asked a question and must respond to that question in the manner of C3PO from Star wars.",
      },
      { role: "user", content: question },
    ],
    model: "gpt-3.5-turbo",
  });
  const answer = completion.choices[0].message;
  return answer.content;
}
