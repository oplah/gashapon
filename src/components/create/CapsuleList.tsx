"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CreateCapsuleInput, TextContent, ImageContent, LinkContent, QuoteContent } from "@/lib/types";

interface CapsuleListProps {
  capsules: CreateCapsuleInput[];
  onRemove: (index: number) => void;
}

function capsuleSummary(c: CreateCapsuleInput): string {
  switch (c.type) {
    case "text":  { const t = (c.content as TextContent).message; return t.slice(0, 55) + (t.length > 55 ? "…" : ""); }
    case "quote": return `"${(c.content as QuoteContent).text.slice(0, 45)}…"`;
    case "image": return (c.content as ImageContent).caption ?? "Image";
    case "link":  return (c.content as LinkContent).label;
  }
}

const TYPE_EMOJI: Record<string, string> = { text:"✉️", quote:"💬", image:"🖼️", link:"🔗" };

const CAPSULE_BG: Record<string, string> = {
  blush: "#f89898", mint: "#6fcf97", lavender: "#b9a7ef", peach: "#f7bc8a", sky: "#87c9f4",
};

export function CapsuleList({ capsules, onRemove }: CapsuleListProps) {
  if (capsules.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-2xl mb-2">📭</p>
        <p className="pixel-label">NO CAPSULES YET</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {capsules.map((c, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 bg-pixel-bg2 p-3"
            style={{ border: "2px solid #3d1a35" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8, height: 0, padding: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Color dot */}
            <div
              className="flex-shrink-0 rounded-full"
              style={{
                width: 24, height: 24,
                background: CAPSULE_BG[c.color ?? "blush"] ?? "#f89898",
                border: "2px solid #3d1a35",
                boxShadow: "2px 2px 0 0 #3d1a35",
              }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">{TYPE_EMOJI[c.type]}</span>
                <span className="pixel-label">{c.type}</span>
              </div>
              <p className="text-xs text-pixel-dark font-sans truncate opacity-80">{capsuleSummary(c)}</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemove(i)}
              className="text-pixel-dark opacity-40 hover:opacity-90 transition-opacity text-lg leading-none flex-shrink-0 font-bold"
              title="Remove"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
