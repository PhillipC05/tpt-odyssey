import { getSession } from "@/lib/auth/session";
import { streamChat, type Message } from "@/lib/ai/client";
import { CHECK_IN_SYSTEM_PROMPT } from "@/lib/ai/prompts/check-in";
import { MessagesSchema } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = MessagesSchema.safeParse((body as { messages?: unknown })?.messages);
  if (!parsed.success) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const allMessages: Message[] = [
    { role: "system", content: CHECK_IN_SYSTEM_PROMPT },
    ...parsed.data,
  ];

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
