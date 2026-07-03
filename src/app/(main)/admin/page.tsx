import { getSession } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Compass, MessageSquareHeart, GraduationCap, Cpu } from "lucide-react";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!isAdminEmail(session.email)) redirect("/dashboard");

  const [
    userCount,
    profileCount,
    activeQuests,
    completedQuests,
    abandonedQuests,
    checkInCount,
    pendingMentorships,
    activeMentorships,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.quest.count({ where: { status: "ACTIVE" } }),
    prisma.quest.count({ where: { status: "COMPLETED" } }),
    prisma.quest.count({ where: { status: "ABANDONED" } }),
    prisma.checkIn.count(),
    prisma.mentorship.count({ where: { status: "PENDING" } }),
    prisma.mentorship.count({ where: { status: "ACTIVE" } }),
  ]);

  const stats = [
    { label: "Users", value: userCount, icon: Users },
    { label: "Profiles onboarded", value: profileCount, icon: Users },
    { label: "Active quests", value: activeQuests, icon: Compass },
    { label: "Completed quests", value: completedQuests, icon: Compass },
    { label: "Abandoned quests", value: abandonedQuests, icon: Compass },
    { label: "Check-ins logged", value: checkInCount, icon: MessageSquareHeart },
    { label: "Pending mentorship requests", value: pendingMentorships, icon: GraduationCap },
    { label: "Active mentorships", value: activeMentorships, icon: GraduationCap },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Usage overview and model configuration for this self-hosted instance.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <Icon className="h-4 w-4 text-primary mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Model configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Default model</span>
            <span className="font-mono">{process.env.OPENROUTER_DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Site name</span>
            <span className="font-mono">{process.env.OPENROUTER_SITE_NAME ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Site URL</span>
            <span className="font-mono">{process.env.OPENROUTER_SITE_URL ?? "—"}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            These are read from environment variables. To change them, update your{" "}
            <code className="font-mono">.env</code> file and restart the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
