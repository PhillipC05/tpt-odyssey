import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Star, Globe } from "lucide-react";
import Link from "next/link";

export default async function CommunityPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } });
  if (!profile) redirect("/onboarding");

  const myInterests = profile.interests;

  const [peers, publicQuests] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: session.userId },
        profile: { interests: { hasSome: myInterests } },
      },
      include: {
        profile: { select: { interests: true, summary: true, isMentor: true, mentorTopics: true } },
        quests: { select: { id: true, status: true } },
      },
      take: 24,
    }),
    prisma.quest.findMany({
      where: { shareId: { not: null }, userId: { not: session.userId } },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        milestones: { select: { status: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  const mentors = peers.filter((p) => p.profile?.isMentor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect with travelers on similar paths.
        </p>
      </div>

      <Tabs defaultValue="peers">
        <TabsList>
          <TabsTrigger value="peers" className="gap-2">
            <Users className="h-4 w-4" />
            Peers ({peers.length})
          </TabsTrigger>
          <TabsTrigger value="mentors" className="gap-2">
            <Star className="h-4 w-4" />
            Mentors ({mentors.length})
          </TabsTrigger>
          <TabsTrigger value="journeys" className="gap-2">
            <Globe className="h-4 w-4" />
            Public journeys ({publicQuests.length})
          </TabsTrigger>
        </TabsList>

        {/* Peers */}
        <TabsContent value="peers" className="mt-6">
          {peers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No fellow travelers found yet — keep going, the community grows.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {peers.map((peer) => {
                const sharedInterests = (peer.profile?.interests ?? []).filter((i) =>
                  myInterests.includes(i)
                );
                return (
                  <Card key={peer.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {peer.avatarUrl && <AvatarImage src={peer.avatarUrl} />}
                          <AvatarFallback>
                            {peer.name?.[0] ?? peer.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {peer.name ?? "Traveler"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {peer.quests.length} quest{peer.quests.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {peer.profile?.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {peer.profile.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {sharedInterests.slice(0, 3).map((i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {i}
                          </Badge>
                        ))}
                        {sharedInterests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{sharedInterests.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Mentors */}
        <TabsContent value="mentors" className="mt-6">
          {mentors.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No mentors available yet in your interest areas.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {mentors.map((mentor) => (
                <Card key={mentor.id}>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {mentor.avatarUrl && <AvatarImage src={mentor.avatarUrl} />}
                        <AvatarFallback>
                          {mentor.name?.[0] ?? mentor.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{mentor.name ?? "Mentor"}</p>
                          <Badge className="text-xs">Mentor</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {mentor.quests.filter((q) => q.status === "COMPLETED").length} quests completed
                        </p>
                      </div>
                    </div>
                    {mentor.profile?.mentorTopics && mentor.profile.mentorTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mentor.profile.mentorTopics.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Public journeys */}
        <TabsContent value="journeys" className="mt-6">
          {publicQuests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No public journeys shared yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicQuests.map((quest) => {
                const done = quest.milestones.filter((m) => m.status === "COMPLETED").length;
                const total = quest.milestones.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Link key={quest.id} href={`/q/${quest.shareId}`} className="block group">
                    <Card className="h-full hover:shadow-sm hover:border-primary/30 transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {quest.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            {quest.user.avatarUrl && <AvatarImage src={quest.user.avatarUrl} />}
                            <AvatarFallback className="text-xs">
                              {quest.user.name?.[0] ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{quest.user.name ?? "Anonymous"}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{done}/{total} milestones</span>
                            <span>{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
