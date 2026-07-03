"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface NewQuestButtonProps {
  label: string;
  size?: "sm" | "default";
}

export function NewQuestButton({ label, size = "sm" }: NewQuestButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const createQuest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quests", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      router.push(`/quest/${data.questId}`);
      router.refresh();
    } catch {
      toast.error("Failed to generate a new quest");
      setIsLoading(false);
    }
  };

  return (
    <Button size={size} onClick={createQuest} disabled={isLoading} className="shrink-0">
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <Plus className="h-4 w-4 mr-1.5" />
      )}
      {isLoading ? "Generating…" : label}
    </Button>
  );
}
