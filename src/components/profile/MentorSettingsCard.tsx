"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MentorSettingsCardProps {
  initialIsMentor: boolean;
  initialMentorTopics: string[];
}

export function MentorSettingsCard({
  initialIsMentor,
  initialMentorTopics,
}: MentorSettingsCardProps) {
  const [isMentor, setIsMentor] = useState(initialIsMentor);
  const [topicsInput, setTopicsInput] = useState(initialMentorTopics.join(", "));
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    const mentorTopics = topicsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMentor, mentorTopics }),
      });
      if (!res.ok) throw new Error();
      toast.success("Mentor settings saved");
    } catch {
      toast.error("Failed to save mentor settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Mentorship
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={isMentor}
            onCheckedChange={(checked) => setIsMentor(checked === true)}
            className="mt-0.5 shrink-0"
          />
          <span className="text-sm leading-relaxed">
            List me as a mentor other travelers can request guidance from.
          </span>
        </label>

        {isMentor && (
          <div className="space-y-1.5 pl-7">
            <Label htmlFor="mentor-topics" className="text-xs text-muted-foreground">
              Topics you can mentor on (comma-separated)
            </Label>
            <Input
              id="mentor-topics"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g. woodworking, public speaking, career pivots"
            />
          </div>
        )}

        <Button size="sm" onClick={save} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
