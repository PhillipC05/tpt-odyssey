"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function signOut() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initial = email[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="User menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover shadow-md z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-border">
            {email}
          </div>
          <button
            onClick={signOut}
            disabled={loading}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
