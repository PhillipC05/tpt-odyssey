import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email/mailer";

const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);

  const staleQuests = await prisma.quest.findMany({
    where: {
      status: "ACTIVE",
      updatedAt: { lt: cutoff },
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: cutoff } }],
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  const byUser = new Map<string, { email: string; name: string | null; questTitles: string[]; questIds: string[] }>();
  for (const quest of staleQuests) {
    const entry = byUser.get(quest.userId) ?? {
      email: quest.user.email,
      name: quest.user.name,
      questTitles: [],
      questIds: [],
    };
    entry.questTitles.push(quest.title);
    entry.questIds.push(quest.id);
    byUser.set(quest.userId, entry);
  }

  let remindersSent = 0;
  const now = new Date();

  for (const { email, name, questTitles, questIds } of byUser.values()) {
    const html = `
      <p>Hi ${name ?? "traveler"},</p>
      <p>You haven't touched ${questTitles.length > 1 ? "these quests" : "this quest"} in a while:</p>
      <ul>${questTitles.map((t) => `<li>${t}</li>`).join("")}</ul>
      <p>Jump back in whenever you're ready.</p>
    `;
    const sent = await sendMail(email, "Your quest is waiting for you", html);
    if (sent) {
      remindersSent += 1;
      await prisma.quest.updateMany({
        where: { id: { in: questIds } },
        data: { lastReminderAt: now },
      });
    }
  }

  return Response.json({ remindersSent, questsChecked: staleQuests.length });
}
