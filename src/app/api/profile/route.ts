import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { generateStructured } from "@/lib/ai/client";
import { ProfileSchema, QuestSchema } from "@/lib/ai/schemas";
import { PROFILE_EXTRACTION_PROMPT } from "@/lib/ai/prompts/onboarding";
import { questGenerationPrompt } from "@/lib/ai/prompts/quest-gen";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();
  const conversationText = messages
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
    .join("\n\n");

  // Extract profile from conversation
  const profileData = await generateStructured(
    [{ role: "user", content: PROFILE_EXTRACTION_PROMPT(conversationText) }],
    ProfileSchema
  );

  // Save profile
  await prisma.profile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      summary: profileData.summary,
      interests: profileData.interests,
      psychAttributes: profileData.psychAttributes,
      talentSignals: profileData.talentSignals,
      onboardingLog: messages,
    },
    update: {
      summary: profileData.summary,
      interests: profileData.interests,
      psychAttributes: profileData.psychAttributes,
      talentSignals: profileData.talentSignals,
      onboardingLog: messages,
    },
  });

  // Generate first quest
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

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) return new Response("Not found", { status: 404 });
  return Response.json(profile);
}
