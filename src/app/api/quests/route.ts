import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

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
