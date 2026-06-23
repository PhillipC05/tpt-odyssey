"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskItemProps {
  task: { id: string; title: string; completed: boolean };
  disabled?: boolean;
}

export function TaskItem({ task, disabled }: TaskItemProps) {
  const [completed, setCompleted] = useState(task.completed);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    const newVal = !completed;
    setCompleted(newVal);

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, completed: newVal }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCompleted(!newVal);
      toast.error("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1.5">
      <Checkbox
        checked={completed}
        onCheckedChange={toggle}
        disabled={isLoading || disabled}
        className="mt-0.5 shrink-0"
      />
      <span
        className={cn(
          "text-sm leading-relaxed transition-colors",
          completed ? "line-through text-muted-foreground" : "text-foreground group-hover:text-foreground"
        )}
      >
        {task.title}
      </span>
    </label>
  );
}
