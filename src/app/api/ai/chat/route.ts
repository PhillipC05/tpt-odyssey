import { getSession } from "@/lib/auth/session";
import { streamChat, type Message } from "@/lib/ai/client";
import { MessagesSchema } from "@/lib/ai/schemas";
import { z } from "zod";

const ChatBodySchema = z.object({
  messages: MessagesSchema,
  systemPrompt: z.string().max(10_000).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ChatBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { messages, systemPrompt } = parsed.data;
  const allMessages: Message[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  let stream: ReadableStream<string>;
  try {
    stream = await streamChat(allMessages);
  } catch {
    return Response.json({ error: "AI service unavailable" }, { status: 502 });
  }
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(value));
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
