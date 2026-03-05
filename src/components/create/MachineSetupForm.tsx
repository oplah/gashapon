"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CreateMachineInput, MachineTheme } from "@/lib/types";
import { THEMES } from "@/lib/types";

interface MachineSetupFormProps {
  onNext: (data: CreateMachineInput) => void;
}

const PIXEL_THEME_COLORS: Record<MachineTheme, string> = {
  default:  "#f0b4ca",
  blush:    "#f89898",
  mint:     "#6fcf97",
  lavender: "#b9a7ef",
  peach:    "#f7bc8a",
  sky:      "#87c9f4",
};

export function MachineSetupForm({ onNext }: MachineSetupFormProps) {
  const [form, setForm] = useState<CreateMachineInput>({
    title: "", description: "", theme: "default", creator_name: "", receiver_name: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onNext(form);
  }

  const themes = Object.keys(THEMES) as MachineTheme[];

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label className="pixel-label block mb-2">Machine name *</label>
        <input
          type="text" required maxLength={60}
          placeholder="e.g. Happy Birthday!"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="pixel-input"
        />
      </div>

      <div>
        <label className="pixel-label block mb-2">Subtitle (optional)</label>
        <textarea
          maxLength={140} rows={2}
          placeholder="e.g. A little something special for you ♥"
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="pixel-input"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="pixel-label block mb-2">From</label>
          <input
            type="text" maxLength={40} placeholder="Your name"
            value={form.creator_name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, creator_name: e.target.value }))}
            className="pixel-input"
          />
        </div>
        <div className="flex-1">
          <label className="pixel-label block mb-2">To</label>
          <input
            type="text" maxLength={40} placeholder="Receiver's name"
            value={form.receiver_name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, receiver_name: e.target.value }))}
            className="pixel-input"
          />
        </div>
      </div>

      {/* Theme picker */}
      <div>
        <label className="pixel-label block mb-2">Color theme</label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm((f) => ({ ...f, theme: key }))}
              className="flex items-center gap-2 p-2 transition-all"
              style={{
                border: `3px solid #3d1a35`,
                boxShadow: form.theme === key ? "3px 3px 0 0 #3d1a35" : "none",
                background: form.theme === key ? PIXEL_THEME_COLORS[key] : "#fef0f8",
              }}
            >
              <div
                style={{ width: 14, height: 14, borderRadius: "50%", background: PIXEL_THEME_COLORS[key], border: "2px solid #3d1a35", flexShrink: 0 }}
              />
              <span className="font-pixel text-pixel-dark truncate" style={{ fontSize: "0.38rem" }}>
                {THEMES[key].label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="pixel-btn w-full bg-pixel-pink2 text-pixel-light" style={{ fontSize: "0.5rem" }}>
        NEXT: ADD CAPSULES →
      </button>
    </motion.form>
  );
}
