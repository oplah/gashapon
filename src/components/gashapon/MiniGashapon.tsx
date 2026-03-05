"use client";

import { motion } from "framer-motion";

const CAPSULE_COLORS = [
  "capsule-flat-blush",
  "capsule-flat-mint",
  "capsule-flat-lavender",
  "capsule-flat-peach",
  "capsule-flat-sky",
];

const CAPSULE_POS = [
  { top: "52%", left: "38%" },
  { top: "22%", left: "18%" },
  { top: "22%", left: "60%" },
  { top: "52%", left: "18%" },
  { top: "10%", left: "38%" },
];

export function MiniGashapon() {
  return (
    <motion.div
      className="relative mx-auto select-none"
      style={{ width: 180, height: 230 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Machine body */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-pixel-pink"
        style={{ width: 150, height: 120, border: "3px solid #3d1a35", boxShadow: "5px 5px 0 0 #3d1a35" }}
      >
        {/* Header stripe */}
        <div className="bg-pixel-pink2 flex items-center justify-center" style={{ height: 22, borderBottom: "3px solid #3d1a35" }}>
          <span className="font-pixel text-pixel-light" style={{ fontSize: "0.38rem", letterSpacing: "0.12em" }}>
            ♦ GASHAPON ♦
          </span>
        </div>

        {/* Coin slot */}
        <div className="flex justify-center mt-2">
          <div className="bg-pixel-dark2" style={{ width: 48, height: 6, border: "2px solid #3d1a35" }} />
        </div>

        {/* Dispense slot */}
        <div className="mx-auto mt-3 bg-pixel-dark2 flex items-center justify-center"
          style={{ width: 90, height: 24, border: "2px solid #3d1a35" }}>
          <div className="bg-pixel-bg2" style={{ width: 60, height: 10, border: "2px solid #3d1a35" }} />
        </div>

        {/* Handle stub */}
        <div className="absolute bg-pixel-pink2"
          style={{ right: -18, top: 24, width: 18, height: 36, border: "3px solid #3d1a35", borderLeft: "none", boxShadow: "3px 3px 0 0 #3d1a35" }}>
          <div className="bg-pixel-light absolute" style={{ width: 12, height: 12, border: "2px solid #3d1a35", top: -6, left: 0 }} />
        </div>
      </div>

      {/* Dome */}
      <div className="absolute left-1/2 -translate-x-1/2 bg-pixel-purple"
        style={{ width: 130, height: 130, top: 0, borderRadius: "50%", border: "3px solid #3d1a35", boxShadow: "4px 4px 0 0 #3d1a35", overflow: "hidden" }}>
        {CAPSULE_COLORS.map((color, i) => (
          <motion.div key={i} className={`pixel-capsule ${color} absolute`}
            style={{ width: 30, height: 30, top: CAPSULE_POS[i].top, left: CAPSULE_POS[i].left }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
        {/* Glass shine */}
        <div className="absolute bg-white opacity-20" style={{ width: 38, height: 38, borderRadius: "50%", top: 10, left: 12 }} />
      </div>

      {/* Neck */}
      <div className="absolute left-1/2 -translate-x-1/2 bg-pixel-pink"
        style={{ width: 40, height: 12, top: 127, border: "3px solid #3d1a35", borderTop: "none" }} />
    </motion.div>
  );
}
