"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatInterface, type ChatMessage } from "@/components/chat/ChatInterface";
import { Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CheckInPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestoneId") ?? "";
  const [questId, setQuestId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setQuestId(id));
  }, [params]);

  const initialMessage = `Well done on completing that milestone — that's real progress.

Let's take a moment to reflect. How are you feeling right now? What was the experience of working through that milestone like for you?`;

  const handleComplete = useCallback(
    async (messages: ChatMessage[]) => {
      if (!questId || !milestoneId) return;
      setIsProcessing(true);
      try {
        const res = await fetch("/api/ai/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, milestoneId, questId }),
        });

        if (!res.ok) throw new Error();
        const { adaptationNote } = await res.json();

        if (adaptationNote) {
          toast.success(`Quest updated: ${adaptationNote}`);
        } else {
          toast.success("Check-in saved. Onward!");
        }

        router.push(`/quest/${questId}`);
      } catch {
        toast.error("Something went wrong saving your check-in.");
        setIsProcessing(false);
      }
    },
    [questId, milestoneId, router]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 px-6 h-14 flex items-center gap-2 shrink-0">
        <Compass className="h-5 w-5 text-primary" />
        <span className="font-semibold">Odyssey</span>
        <span className="text-muted-foreground text-sm ml-2">· Milestone check-in</span>
      </header>

      {isProcessing ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="font-medium">Saving your reflection...</p>
            <p className="text-sm text-muted-foreground mt-1">Adapting your quest if needed</p>
          </div>
        </div>
      ) : (
        <ChatInterface
          className="flex-1"
          initialMessage={initialMessage}
          apiEndpoint="/api/ai/check-in-chat"
          completionMarker="[CHECKIN_READY]"
          onComplete={handleComplete}
          placeholder="Share how it went..."
        />
      )}
    </div>
  );
}
