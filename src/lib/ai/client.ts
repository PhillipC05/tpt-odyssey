import OpenAI from "openai";
import { z } from "zod";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    "X-Title": process.env.OPENROUTER_SITE_NAME ?? "TPT Odyssey",
  },
});

const DEFAULT_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet";

export type Message = { role: "user" | "assistant" | "system"; content: string };

export async function streamChat(
  messages: Message[],
  model = DEFAULT_MODEL
): Promise<ReadableStream<string>> {
  const stream = await openrouter.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(text);
      }
      controller.close();
    },
  });
}

export async function generateStructured<T>(
  messages: Message[],
  schema: z.ZodType<T>,
  model = DEFAULT_MODEL
): Promise<T> {
  const response = await openrouter.chat.completions.create({
    model,
    messages: [
      ...messages,
      {
        role: "system" as const,
        content:
          "Respond ONLY with valid JSON matching the requested schema. No markdown, no explanation.",
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return schema.parse(parsed);
}

export async function chat(
  messages: Message[],
  model = DEFAULT_MODEL
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model,
    messages,
  });
  return response.choices[0]?.message?.content ?? "";
}
