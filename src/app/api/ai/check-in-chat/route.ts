import { getSession } from "@/lib/auth/session";
import { streamChat, type Message } from "@/lib/ai/client";
import { CHECK_IN_SYSTEM_PROMPT } from "@/lib/ai/prompts/check-in";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();
  const allMessages: Message[] = [
    { role: "system", content: CHECK_IN_SYSTEM_PROMPT },
    ...messages,
  ];

  const stream = await streamChat(allMessages);
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
