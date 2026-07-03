import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { generateQuestForUser } from "@/lib/quest/generate";
import { z } from "zod";

const AbandonSchema = z.object({
  action: z.enum(["abandon", "restart", "pivot"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AbandonSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const quest = await prisma.quest.findFirst({
    where: { id, userId: session.userId },
    include: { milestones: { orderBy: { order: "asc" } } },
  });
  if (!quest) return new Response("Not found", { status: 404 });

  const { action } = parsed.data;

  if (action === "abandon") {
    await prisma.quest.update({ where: { id }, data: { status: "ABANDONED" } });
    return Response.json({ questId: id });
  }

  if (action === "restart") {
    const milestoneIds = quest.milestones.map((m) => m.id);
    await prisma.$transaction([
      prisma.checkIn.deleteMany({ where: { milestoneId: { in: milestoneIds } } }),
      prisma.task.updateMany({
        where: { milestoneId: { in: milestoneIds } },
        data: { completed: false },
      }),
      prisma.milestone.updateMany({
        where: { questId: id },
        data: { status: "PENDING" },
      }),
      ...(quest.milestones.length > 0
        ? [
            prisma.milestone.update({
              where: { id: quest.milestones[0].id },
              data: { status: "IN_PROGRESS" },
            }),
          ]
        : []),
      prisma.quest.update({ where: { id }, data: { status: "ACTIVE" } }),
    ]);
    return Response.json({ questId: id });
  }

  // pivot
  await prisma.quest.update({ where: { id }, data: { status: "ABANDONED" } });
  let newQuest;
  try {
    newQuest = await generateQuestForUser(session.userId);
  } catch {
    return Response.json({ error: "Failed to generate a new quest" }, { status: 502 });
  }
  return Response.json({ questId: newQuest.id });
}
