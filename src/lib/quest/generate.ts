import { prisma } from "@/lib/db";
import { generateStructured } from "@/lib/ai/client";
import { QuestSchema } from "@/lib/ai/schemas";
import { questGenerationPrompt } from "@/lib/ai/prompts/quest-gen";
import type { ProfileData } from "@/lib/ai/schemas";

export async function generateQuestForUser(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile required");

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

  return prisma.quest.create({
    data: {
      userId,
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
}
