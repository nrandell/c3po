"use server";
import { ElevenLabsClient } from "elevenlabs";

const apiKey = process.env.XI_API_KEY;
console.log("api key", apiKey);
const client = new ElevenLabsClient({ apiKey });

export async function createAudioStream(text: string) {
  const audioStream = await client.generate({ voice: "Nick test 2", text });
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  const bigBuffer = Buffer.concat(chunks);
  const encoded = bigBuffer.toString("base64");
  return encoded;
}
