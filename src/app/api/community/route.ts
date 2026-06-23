import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) return new Response("Profile required", { status: 400 });

  const myInterests = profile.interests;

  // Find users with overlapping interests (excluding self)
  const peers = await prisma.user.findMany({
    where: {
      id: { not: session.userId },
      profile: {
        interests: { hasSome: myInterests },
      },
    },
    include: {
      profile: {
        select: { interests: true, summary: true, isMentor: true, mentorTopics: true },
      },
      quests: { select: { id: true, status: true } },
    },
    take: 20,
  });

  const mentors = peers.filter((p) => p.profile?.isMentor);
  const peerList = peers.filter((p) => !p.profile?.isMentor);

  // Public quest journeys
  const publicQuests = await prisma.quest.findMany({
    where: { shareId: { not: null }, userId: { not: session.userId } },
    include: {
      user: {
        select: { name: true, avatarUrl: true },
      },
      milestones: {
        select: { status: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  return Response.json({ peers: peerList, mentors, publicQuests });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { isMentor, mentorTopics } = await req.json();

  await prisma.profile.update({
    where: { userId: session.userId },
    data: {
      ...(typeof isMentor === "boolean" && { isMentor }),
      ...(mentorTopics && { mentorTopics }),
    },
  });

  return Response.json({ ok: true });
}
