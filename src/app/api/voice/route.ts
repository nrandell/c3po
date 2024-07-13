import { NextRequest, NextResponse } from "next/server";

import { ElevenLabsClient } from "elevenlabs";

const apiKey = process.env.XI_API_KEY;
console.log("api key", apiKey);
const client = new ElevenLabsClient({ apiKey });

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const text = params.get("text");
  console.log("get voice for", text);
  if (!text) {
    return new Response("No data", { status: 400 });
  }
  const audioStream = await client.generate({ voice: "Nick test 2", text });

  var stream = new ReadableStream({
    pull: async (controller) => {
      for await (const chunk of audioStream) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
  return new Response(stream);
}
