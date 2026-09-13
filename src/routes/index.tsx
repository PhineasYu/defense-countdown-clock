import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "4-Minute Countdown" },
      { name: "description", content: "A minimal and precise 4-minute countdown timer" },
      { property: "og:title", content: "4-Minute Countdown" },
      { property: "og:description", content: "A minimal and precise 4-minute countdown timer" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const TOTAL_SECONDS = 4 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function Index() {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (running && remaining > 0) {
      lastTickRef.current = performance.now();
      intervalRef.current = setInterval(() => {
        const now = performance.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        if (delta >= 1) {
          setRemaining((prev) => {
            const next = Math.max(0, prev - delta);
            return next;
          });
          lastTickRef.current = now;
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
    }
  }, [remaining, running]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((prev) => !prev);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        setRunning(false);
        setRemaining(TOTAL_SECONDS);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const progress = remaining / TOTAL_SECONDS;
  const isUrgent = remaining <= 30 && remaining > 0;
  const isOver = remaining === 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="relative flex w-full flex-col items-center gap-6 px-4">
        <div className="w-full text-center">
          <time
            className={`block font-mono text-[min(34vw,72vh)] font-light leading-[0.85] tracking-tighter ${
              isOver
                ? "text-destructive"
                : isUrgent
                  ? "text-destructive"
                  : "text-foreground"
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {formatTime(remaining)}
          </time>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            {isOver ? "Time's up" : running ? "Running" : "Paused"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((prev) => !prev)}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={running ? "Pause" : "Start"}
          >
            {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setRemaining(TOTAL_SECONDS);
            }}
            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Reset"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Shortcuts: Space to start/pause · R to reset
        </p>
      </div>
    </div>
  );
}
