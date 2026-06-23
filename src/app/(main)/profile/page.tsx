import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, Star, Zap } from "lucide-react";

const CURIOSITY_LABELS: Record<string, string> = {
  explorer: "Explorer — drawn to discovery and new frontiers",
  builder: "Builder — energized by making things real",
  connector: "Connector — finds meaning through people and relationships",
  analyst: "Analyst — thrives on understanding systems deeply",
  creator: "Creator — compelled to express and invent",
};

const MOTIVATION_LABELS: Record<string, string> = {
  mastery: "Mastery — driven to get really good at things",
  purpose: "Purpose — motivated by contributing to something larger",
  autonomy: "Autonomy — energized by self-direction",
  connection: "Connection — fulfilled through deep relationships",
};

const BIG_FIVE_LABELS = [
  { key: "openness", label: "Openness" },
  { key: "conscientiousness", label: "Conscientiousness" },
  { key: "extraversion", label: "Extraversion" },
  { key: "agreeableness", label: "Agreeableness" },
  { key: "neuroticism", label: "Neuroticism" },
];

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      quests: { select: { id: true, status: true } },
    },
  });

  if (!user?.profile) redirect("/onboarding");

  const { profile } = user;
  const attrs = profile.psychAttributes as Record<string, string | number>;
  const completedCount = user.quests.filter((q) => q.status === "COMPLETED").length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          <AvatarFallback className="text-xl">
            {user.name?.[0] ?? user.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name ?? "Your Profile"}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>{user.quests.length} quests</span>
            {completedCount > 0 && (
              <>
                <span>·</span>
                <span>{completedCount} completed</span>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Your essence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{profile.summary}</p>
        </CardContent>
      </Card>

      {/* Curiosity & Motivation */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Curiosity type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {CURIOSITY_LABELS[attrs.curiosityType as string] ?? attrs.curiosityType}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              Motivation style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {MOTIVATION_LABELS[attrs.motivationStyle as string] ?? attrs.motivationStyle}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Talent signals */}
      {profile.talentSignals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Latent talents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {profile.talentSignals.map((signal) => (
                <li key={signal} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">·</span>
                  {signal}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Big Five */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Personality profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {BIG_FIVE_LABELS.map(({ key, label }) => {
            const val = Number(attrs[key] ?? 5);
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{val}/10</span>
                </div>
                <Progress value={val * 10} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
