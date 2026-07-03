import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { generateStructured } from "@/lib/ai/client";
import { CheckInResultSchema, AdaptedQuestSchema, MessagesSchema } from "@/lib/ai/schemas";
import { checkInExtractionPrompt } from "@/lib/ai/prompts/check-in";
import { adaptQuestPrompt } from "@/lib/ai/prompts/adapt-quest";
import { z } from "zod";

const CheckInBodySchema = z.object({
  messages: MessagesSchema,
  milestoneId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CheckInBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { messages, milestoneId } = parsed.data;

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId, quest: { userId: session.userId } },
  });
  if (!milestone) return new Response("Not found", { status: 404 });

  // Derive questId from the verified milestone rather than trusting the client,
  // so a caller can't attach this check-in to a quest they don't own.
  const questId = milestone.questId;

  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  // Extract check-in scores
  let result;
  try {
    result = await generateStructured(
      [{ role: "user", content: checkInExtractionPrompt(milestone.title, conversationText) }],
      CheckInResultSchema
    );
  } catch {
    return Response.json({ error: "Failed to extract check-in" }, { status: 502 });
  }

  // Save check-in
  const checkIn = await prisma.checkIn.create({
    data: {
      userId: session.userId,
      questId,
      milestoneId,
      moodScore: result.moodScore,
      flowScore: result.flowScore,
      engagementScore: result.engagementScore,
      summary: result.summary,
      rawLog: messages,
      questAdapted: result.shouldAdapt,
    },
  });

  let adaptationNote: string | null = null;

  if (result.shouldAdapt && result.adaptationReason) {
    const quest = await prisma.quest.findFirst({
      where: { id: questId, userId: session.userId },
      include: {
        milestones: {
          orderBy: { order: "asc" },
          include: { tasks: true, resources: true },
        },
      },
    });

    if (quest) {
      let adapted;
      try {
        adapted = await generateStructured(
          [
            {
              role: "user",
              content: adaptQuestPrompt(
                quest.title,
                quest.narrative,
                quest.milestones,
                result.adaptationReason,
                profile?.summary ?? ""
              ),
            },
          ],
          AdaptedQuestSchema
        );
      } catch {
        // Check-in itself already saved; adaptation is best-effort and can fail silently.
        return Response.json({ checkIn, adaptationNote: null });
      }

      adaptationNote = adapted.adaptationNote;

      // Replace pending milestones with adapted ones
      const pendingMilestones = quest.milestones.filter((m) => m.status === "PENDING");
      const adaptedPending = adapted.milestones.filter(
        (_, i) => quest.milestones[i]?.status === "PENDING"
      );

      for (const pending of pendingMilestones) {
        await prisma.task.deleteMany({ where: { milestoneId: pending.id } });
        await prisma.resource.deleteMany({ where: { milestoneId: pending.id } });
        await prisma.milestone.delete({ where: { id: pending.id } });
      }

      let orderOffset = quest.milestones.filter((m) => m.status !== "PENDING").length;
      for (const am of adaptedPending) {
        await prisma.milestone.create({
          data: {
            questId,
            title: am.title,
            description: am.description,
            order: orderOffset++,
            estimatedDays: am.estimatedDays ?? null,
            tasks: { create: am.tasks.map((t) => ({ title: t.title, order: t.order })) },
            resources: {
              create: am.resources.map((r) => ({
                title: r.title,
                url: r.url,
                type: r.type,
                description: r.description ?? null,
              })),
            },
          },
        });
      }
    }
  }

  return Response.json({ checkIn, adaptationNote });
}
