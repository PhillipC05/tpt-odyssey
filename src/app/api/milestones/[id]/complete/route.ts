import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const milestone = await prisma.milestone.findFirst({
    where: { id, quest: { userId: session.userId } },
  });
  if (!milestone) return new Response("Not found", { status: 404 });

  await prisma.milestone.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  // Activate the next milestone if exists
  const nextMilestone = await prisma.milestone.findFirst({
    where: { questId: milestone.questId, order: milestone.order + 1 },
  });
  if (nextMilestone) {
    await prisma.milestone.update({
      where: { id: nextMilestone.id },
      data: { status: "IN_PROGRESS" },
    });
  } else {
    // All milestones done — mark quest complete
    await prisma.quest.update({
      where: { id: milestone.questId },
      data: { status: "COMPLETED" },
    });
  }

  return Response.json({ milestoneId: id, questId: milestone.questId });
}
