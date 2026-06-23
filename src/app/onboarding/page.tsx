"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface, type ChatMessage } from "@/components/chat/ChatInterface";
import { Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";

const INITIAL_MESSAGE = `Welcome. I'm Odyssey — your guide on a journey toward mastery and purpose.

I'm not here to help you find a job. I'm here to help you discover what genuinely lights you up, and to design a path toward it that's uniquely yours.

This will take about 10 minutes. Let's start simply:

What's something you've found yourself thinking about a lot lately — not because you have to, but because it genuinely fascinates you?`;

export default function OnboardingPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = useCallback(
    async (messages: ChatMessage[]) => {
      setIsProcessing(true);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });

        if (!res.ok) throw new Error("Profile creation failed");

        toast.success("Your profile has been created! Generating your first quest...");

        // Quest generation happens server-side after profile creation
        const data = await res.json();
        router.push(data.questId ? `/quest/${data.questId}` : "/dashboard");
      } catch {
        toast.error("Something went wrong. Please try again.");
        setIsProcessing(false);
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 px-6 h-14 flex items-center gap-2 shrink-0">
        <Compass className="h-5 w-5 text-primary" />
        <span className="font-semibold">Odyssey</span>
        <span className="text-muted-foreground text-sm ml-2">· Your intake conversation</span>
      </header>

      {/* Chat */}
      {isProcessing ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="font-medium">Building your profile and first quest...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
          </div>
        </div>
      ) : (
        <ChatInterface
          className="flex-1"
          initialMessage={INITIAL_MESSAGE}
          apiEndpoint="/api/ai/onboarding-chat"
          completionMarker="[PROFILE_READY]"
          onComplete={handleComplete}
          placeholder="Share your thoughts..."
        />
      )}
    </div>
  );
}
