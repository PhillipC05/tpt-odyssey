import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { generateStructured } from "@/lib/ai/client";
import { QuestSchema } from "@/lib/ai/schemas";
import { questGenerationPrompt } from "@/lib/ai/prompts/quest-gen";
import type { ProfileData } from "@/lib/ai/schemas";

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

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) return new Response("Profile required", { status: 400 });

  const profileData: ProfileData = {
    summary: profile.summary,
    interests: profile.interests,
    psychAttributes: profile.psychAttributes as ProfileData["psychAttributes"],
    talentSignals: profile.talentSignals,
  };

  const questData = await generateStructured(
    [{ role: "user", content: questGenerationPrompt(profileData) }],
    QuestSchema
  );

  const quest = await prisma.quest.create({
    data: {
      userId: session.userId,
      title: questData.title,
      narrative: questData.narrative,
      milestones: {
        create: questData.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          order: m.order,
          estimatedDays: m.estimatedDays ?? null,
          tasks: {
            create: m.tasks.map((t) => ({ title: t.title, order: t.order })),
          },
          resources: {
            create: m.resources.map((r) => ({
              title: r.title,
              url: r.url,
              type: r.type,
              description: r.description ?? null,
            })),
          },
        })),
      },
    },
  });

  return Response.json({ questId: quest.id });
}
