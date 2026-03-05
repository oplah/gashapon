"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { Capsule, TextContent, ImageContent, LinkContent, QuoteContent } from "@/lib/types";
import { sounds } from "@/lib/sounds";

interface CapsuleRevealProps {
  capsule: Capsule;
  onClose: () => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  blush:    { bg: "#f89898", border: "#e05050" },
  mint:     { bg: "#6fcf97", border: "#3aaa6b" },
  lavender: { bg: "#b9a7ef", border: "#8b73d9" },
  peach:    { bg: "#f7bc8a", border: "#e0915a" },
  sky:      { bg: "#87c9f4", border: "#4fa8d9" },
};

const REVEAL_EMOJIS = ["👑","💕","😆","🤩","✨","😎","👌","🔥","🏆","🎀","🫶🏻","💌","💓"];

export function CapsuleReveal({ capsule, onClose }: CapsuleRevealProps) {
  const colorStyle = COLOR_MAP[capsule.color] ?? COLOR_MAP.blush;
  const emoji = REVEAL_EMOJIS[Math.floor(Math.random() * REVEAL_EMOJIS.length)];

  useEffect(() => {
    sounds.playSFX("open");
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-pixel-dark2/50"
        style={{ backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-sm bg-pixel-light overflow-hidden"
        style={{ border: "4px solid #3d1a35", boxShadow: "8px 8px 0 0 #3d1a35" }}
        initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
      >
        {/* Coloured header bar */}
        <div
          className="h-28 flex items-center justify-center relative overflow-hidden"
          style={{ background: colorStyle.bg, borderBottom: "4px solid #3d1a35" }}
        >
          {/* Pixel sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-pixel-light"
              style={{
                width: 6, height: 6,
                top:  `${20 + (i % 3) * 25}%`,
                left: `${10 + i * 14}%`,
                border: "2px solid #3d1a35",
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.5, 0], rotate: 45 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            />
          ))}
          <motion.div
            className="text-center"
            style={{ fontSize: "2.2rem" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
          >
            {emoji}
          </motion.div>

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 bg-pixel-light opacity-40" style={{ width: 8, height: 8, border: "2px solid #3d1a35" }} />
          <div className="absolute top-2 right-2 bg-pixel-light opacity-40" style={{ width: 8, height: 8, border: "2px solid #3d1a35" }} />
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <CapsuleContent capsule={capsule} />

          <button
            onClick={onClose}
            className="pixel-btn w-full bg-pixel-pink hover:bg-pixel-pink2 text-pixel-dark mt-2"
          >
            CLOSE  ♥
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CapsuleContent({ capsule }: { capsule: Capsule }) {
  switch (capsule.type) {
    case "text": {
      const c = capsule.content as TextContent;
      return (
        <div className="space-y-2">
          <p className="pixel-label mb-2">— message —</p>
          <p className="text-pixel-dark text-sm leading-relaxed whitespace-pre-wrap font-sans">{c.message}</p>
        </div>
      );
    }
    case "image": {
      const c = capsule.content as ImageContent;
      return (
        <div className="space-y-3">
          <div className="w-full aspect-video overflow-hidden" style={{ border: "3px solid #3d1a35" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.url} alt={c.caption ?? "Capsule image"} className="w-full h-full object-cover" />
          </div>
          {c.caption && <p className="text-sm text-pixel-dark italic text-center font-sans">{c.caption}</p>}
        </div>
      );
    }
    case "link": {
      const c = capsule.content as LinkContent;
      return (
        <div className="space-y-3">
          <p className="pixel-label">— link —</p>
          <p className="text-pixel-dark font-bold text-sm font-sans">{c.label}</p>
          {c.preview && <p className="text-sm text-pixel-dark opacity-70 font-sans">{c.preview}</p>}
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn bg-pixel-purple text-pixel-light inline-flex"
          >
            OPEN →
          </a>
        </div>
      );
    }
    case "quote": {
      const c = capsule.content as QuoteContent;
      return (
        <div className="space-y-2">
          <p className="text-pixel-dark text-sm leading-relaxed italic font-sans">
            &ldquo;{c.text}&rdquo;
          </p>
          {c.author && <p className="pixel-label">— {c.author}</p>}
        </div>
      );
    }
    default:
      return <p className="text-pixel-dark text-sm font-sans">Unknown capsule type.</p>;
  }
}
