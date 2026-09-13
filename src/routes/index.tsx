import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "4分钟倒计时 | 答辩展示" },
      { name: "description", content: "极简精确的4分钟答辩倒计时器" },
      { property: "og:title", content: "4分钟倒计时 | 答辩展示" },
      { property: "og:description", content: "极简精确的4分钟答辩倒计时器" },
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
      <div className="relative flex flex-col items-center gap-10">
        <div
          className={`relative flex aspect-square w-72 items-center justify-center rounded-full border-4 transition-colors duration-300 sm:w-96 ${
            isOver
              ? "border-destructive"
              : isUrgent
                ? "border-destructive/70"
                : "border-primary/20"
          }`}
        >
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={
                isOver
                  ? "text-destructive/20"
                  : isUrgent
                    ? "text-destructive/20"
                    : "text-primary/10"
              }
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 289} 289`}
              className={
                isOver
                  ? "text-destructive"
                  : isUrgent
                    ? "text-destructive"
                    : "text-primary"
              }
              style={{ transition: "stroke-dasharray 0.3s ease" }}
            />
          </svg>

          <div className="z-10 text-center">
            <time
              className={`font-mono text-7xl font-light tracking-tighter sm:text-8xl ${
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
            <p className="mt-2 text-sm text-muted-foreground">
              {isOver ? "时间到" : running ? "进行中" : "已暂停"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((prev) => !prev)}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={running ? "暂停" : "开始"}
          >
            {running ? "暂停" : remaining === 0 ? "重新开始" : "开始"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setRemaining(TOTAL_SECONDS);
            }}
            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="重置"
          >
            重置
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          快捷键：空格键 开始/暂停 · R 重置
        </p>
      </div>
    </div>
  );
}
