"use client";

import { useState, useEffect } from "react";
import { sounds } from "@/lib/sounds";

export function AudioControls() {
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // Start ambient on first mount (ambient starts lazily on first user click)
  useEffect(() => {
    function handleFirstInteraction() {
      if (!started) {
        sounds.startAmbient();
        setStarted(true);
      }
      document.removeEventListener("click", handleFirstInteraction);
    }
    document.addEventListener("click", handleFirstInteraction);
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, [started]);

  function handleToggle() {
    const nowMuted = sounds.toggleMute();
    setMuted(nowMuted);
    // Start ambient on first interaction if not yet started
    if (!started) {
      sounds.startAmbient();
      setStarted(true);
    }
  }

  return (
    <button
      onClick={handleToggle}
      title={muted ? "Unmute" : "Mute"}
      className="pixel-btn bg-pixel-pink text-pixel-dark text-xs px-3 py-2 flex items-center gap-1.5 select-none"
      style={{ fontFamily: "var(--font-pixel)" }}
    >
      <span className="text-sm">{muted ? "🔇" : "🎵"}</span>
      <span className="hidden sm:inline">{muted ? "muted" : "music"}</span>
    </button>
  );
}
