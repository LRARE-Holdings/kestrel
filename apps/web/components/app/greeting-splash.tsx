"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KestrelMark } from "@/components/ui/logo";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const REVEAL_DELAY_MS = 1800;
const SESSION_KEY = "kestrel-greeted";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingSplash({ firstName }: { firstName: string }) {
  const [phase, setPhase] = useState<"greeting" | "revealing" | "done">(
    "greeting",
  );
  const [shouldShow, setShouldShow] = useState(false);

  // Gate: check sessionStorage and reduced-motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(SESSION_KEY, "true");
      return;
    }
    setShouldShow(true);
  }, []);

  // Lock body scroll while overlay is visible
  useEffect(() => {
    if (!shouldShow || phase === "done") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldShow, phase]);

  // Start the reveal after the greeting has been visible long enough
  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(() => setPhase("revealing"), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  const handleExitComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setPhase("done");
  }, []);

  if (!shouldShow || phase === "done") return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {phase !== "revealing" && (
        <motion.div
          key="greeting-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cream"
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <div className="flex flex-col items-center">
            {/* Bird mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <KestrelMark className="h-16 w-auto text-kestrel" />
            </motion.div>

            {/* Greeting text */}
            <motion.p
              className="mt-6 font-display text-2xl tracking-tight text-ink sm:text-3xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT_EXPO }}
            >
              {getGreeting()}, {firstName}.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
