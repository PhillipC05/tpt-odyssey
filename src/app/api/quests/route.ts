import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { generateQuestForUser } from "@/lib/quest/generate";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const quests = await prisma.quest.findMany({
    where: { userId: session.userId },
    include: {
      milestones: {
        orderBy: { order: "asc" },
        include: { tasks: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(quests);
}

export async function POST() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let quest;
  try {
    quest = await generateQuestForUser(session.userId);
  } catch {
    return Response.json({ error: "Profile required" }, { status: 400 });
  }

  return Response.json({ questId: quest.id });
}
