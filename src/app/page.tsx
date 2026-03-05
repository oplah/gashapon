"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MiniGashapon } from "@/components/gashapon/MiniGashapon";
import { AudioControls } from "@/components/ui/AudioControls";

const STEPS = [
  { emoji: "✏️", title: "CREATE",   desc: "Add messages, photos & surprises" },
  { emoji: "🔗", title: "SHARE",    desc: "Send the unique link" },
  { emoji: "🎉", title: "DISCOVER", desc: "They turn the handle & reveal capsules" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-2xl mx-auto w-full">
        <span className="font-pixel text-pixel-dark" style={{ fontSize: "0.65rem", letterSpacing: "0.06em" }}>
          GASHAPON
        </span>
        <div className="flex items-center gap-3">
          <AudioControls />
          <Link href="/create">
            <button className="pixel-btn bg-pixel-pink2 text-pixel-light">
              CREATE →
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-10">
        {/* Machine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MiniGashapon />
        </motion.div>

        {/* Headline */}
        <motion.div
          className="max-w-md space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="font-pixel text-pixel-dark leading-loose" style={{ fontSize: "0.85rem" }}>
            SEND A SURPRISE<br />
            <span style={{ color: "#e2789e" }}>CAPSULE MACHINE</span>
          </h1>
          <p className="text-pixel-dark font-sans text-base leading-relaxed opacity-80">
            Fill it with messages, photos & memories.<br />
            Let someone turn the handle to reveal surprises.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Link href="/create">
            <button className="pixel-btn bg-pixel-pink2 text-pixel-light" style={{ fontSize: "0.6rem", padding: "14px 28px" }}>
              ♦  CREATE A MACHINE  ♦
            </button>
          </Link>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="pixel-card p-4 text-center space-y-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="text-2xl">{s.emoji}</div>
              <div className="font-pixel text-pixel-dark" style={{ fontSize: "0.5rem", letterSpacing: "0.06em" }}>{s.title}</div>
              <div className="text-xs text-pixel-dark opacity-70 font-sans leading-relaxed">{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <footer className="text-center py-5 font-pixel opacity-40" style={{ fontSize: "0.4rem", letterSpacing: "0.1em", color: "#3d1a35" }}>
        MADE WITH CARE  ♥  GASHAPON
      </footer>
    </main>
  );
}
