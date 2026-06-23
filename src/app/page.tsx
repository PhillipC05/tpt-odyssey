import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Compass, Sparkles, Users, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg tracking-tight">TPT Odyssey</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#open-source" className="hover:text-foreground transition-colors">Open source</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Begin your quest</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32 max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-6">
          Open source · Apache 2.0
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
          Your life,{" "}
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            as a quest
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          TPT Odyssey is an AI-driven mastery engine that maps your unique curiosities,
          psychology, and latent talents into evolving quests — not jobs. Built for the
          post-career world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/sign-up">
              Start your journey <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://github.com/tpt-odyssey/odyssey" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-4">
            How Odyssey works
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            A three-part cycle that evolves with you — forever.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-6 w-6" />,
                step: "01",
                title: "Discover yourself",
                body: "A conversational AI intake maps your psychology, hidden talents, and genuine curiosities — not your resume.",
              },
              {
                icon: <Compass className="h-6 w-6" />,
                step: "02",
                title: "Receive your quest",
                body: "Odyssey designs a personalized narrative arc connecting your interests in surprising ways, with milestones, tasks, and curated resources.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                step: "03",
                title: "Grow and connect",
                body: "Regular AI check-ins adapt your path as you evolve. Connect with peers, find mentors, and share your journey publicly.",
              },
            ].map((f) => (
              <div key={f.step} className="relative p-6 rounded-2xl border border-border/60 bg-card">
                <div className="absolute top-6 right-6 text-xs font-mono text-muted-foreground/50">
                  {f.step}
                </div>
                <div className="mb-4 text-primary">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open source callout */}
      <section id="open-source" className="py-20 px-6 border-t border-border/40 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            Open architecture of human purpose
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            TPT Odyssey is fully open source under Apache 2.0. Self-host it, fork it,
            contribute to it. Because the infrastructure of human flourishing should
            belong to everyone.
          </p>
          <Button variant="outline" asChild>
            <a href="https://github.com/tpt-odyssey/odyssey" target="_blank" rel="noopener noreferrer">
              Read the source
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span>TPT Odyssey</span>
            <span>·</span>
            <span>Apache 2.0</span>
          </div>
          <p>Built for the post-career world.</p>
        </div>
      </footer>
    </div>
  );
}
