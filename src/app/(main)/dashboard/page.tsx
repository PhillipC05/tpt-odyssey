import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { QuestCard } from "@/components/quest/QuestCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      quests: {
        include: {
          milestones: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, status: true, order: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // New user with no profile — send to onboarding
  if (!user?.profile) redirect("/onboarding");

  const activeQuests = user.quests.filter((q) => q.status === "ACTIVE");
  const completedQuests = user.quests.filter((q) => q.status === "COMPLETED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Your Quests"}
          </h1>
          {user.profile && (
            <p className="text-muted-foreground mt-1 text-sm max-w-xl line-clamp-2">
              {user.profile.summary}
            </p>
          )}
        </div>
        <Button size="sm" asChild className="shrink-0">
          <Link href="/api/quests/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New quest
          </Link>
        </Button>
      </div>

      {/* Active quests */}
      {activeQuests.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Active quests
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQuests.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">No active quests</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to begin a new journey?
          </p>
          <Button asChild size="sm">
            <Link href="/api/quests/new">Start a quest</Link>
          </Button>
        </div>
      )}

      {/* Completed quests */}
      {completedQuests.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Completed
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedQuests.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
