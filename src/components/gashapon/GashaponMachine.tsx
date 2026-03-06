"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Capsule, MachineTheme } from "@/lib/types";
import { Handle } from "./Handle";
import { CapsuleReveal } from "./CapsuleReveal";
import { sounds } from "@/lib/sounds";

const CAPSULE_COLORS = [
  "capsule-flat-blush",
  "capsule-flat-mint",
  "capsule-flat-lavender",
  "capsule-flat-peach",
  "capsule-flat-sky",
];

const CAPSULE_POSITIONS = [
  { top: "50%", left: "38%" },
  { top: "18%", left: "18%" },
  { top: "20%", left: "60%" },
  { top: "50%", left: "12%" },
  { top: "50%", left: "64%" },
  { top: "6%",  left: "38%" },
  { top: "70%", left: "38%" },
  { top: "35%", left: "38%" },
];

interface GashaponMachineProps {
  capsuleCount: number;
  remainingCount: number;
  theme?: MachineTheme;
  onTurnHandle: () => Promise<Capsule | null>;
}

export function GashaponMachine({
  capsuleCount,
  remainingCount,
  onTurnHandle,
}: GashaponMachineProps) {
  const [isTurning, setIsTurning]       = useState(false);
  const [droppedCapsule, setDropped]    = useState<Capsule | null>(null);
  const [showReveal, setShowReveal]     = useState(false);
  const [handleRotation, setHandleRot] = useState(0);
  const isEmpty = remainingCount === 0;

  const domeCount = Math.min(remainingCount, 8);
  const domeCapsules = Array.from({ length: domeCount }, (_, i) => ({
    color: CAPSULE_COLORS[i % CAPSULE_COLORS.length],
    pos: CAPSULE_POSITIONS[i] ?? { top: "40%", left: "40%" },
    size: 34 - i * 2,
  }));

  async function handleTurn() {
    if (isTurning || isEmpty) return;
    sounds.playSFX("crank");
    setIsTurning(true);
    setHandleRot((r) => r + 360);

    await new Promise((r) => setTimeout(r, 700));
    const capsule = await onTurnHandle();

    if (capsule) {
      sounds.playSFX("drop");
      setDropped(capsule);
      await new Promise((r) => setTimeout(r, 700));
      setShowReveal(true);
    }
    setIsTurning(false);
  }

  function handleCloseReveal() {
    setShowReveal(false);
    setDropped(null);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 select-none">
        {/* Counter pill */}
        <div
          className="bg-pixel-light font-pixel text-pixel-dark"
          style={{ border: "3px solid #3d1a35", boxShadow: "3px 3px 0 0 #3d1a35", padding: "6px 16px", fontSize: "0.48rem", letterSpacing: "0.06em" }}
        >
          {isEmpty
            ? "ALL OPENED ✓"
            : `${remainingCount} / ${capsuleCount} REMAINING`}
        </div>

        {/* Machine wrapper (machine + handle side by side) */}
        <div className="flex items-start gap-0">
          {/* ── Main machine body ──────────────────────── */}
          <div
            className="bg-pixel-pink relative"
            style={{
              width: 240,
              border: "4px solid #3d1a35",
              boxShadow: "6px 6px 0 0 #3d1a35",
            }}
          >
            {/* Top header bar */}
            <div
              className="bg-pixel-pink2 flex items-center justify-center gap-2"
              style={{ height: 28, borderBottom: "4px solid #3d1a35" }}
            >
              <span className="font-pixel text-pixel-light" style={{ fontSize: "0.45rem", letterSpacing: "0.12em" }}>
                ♦ GACHABOX ♦
              </span>
            </div>

            {/* Dome / globe */}
            <div className="flex justify-center pt-3 pb-1 px-3">
              <div
                className="bg-pixel-purple w-full relative overflow-hidden"
                style={{
                  height: 180,
                  borderRadius: "50%",
                  border: "4px solid #3d1a35",
                  boxShadow: "inset 3px 3px 0 0 rgba(255,255,255,0.2)",
                }}
              >
                {isEmpty ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <span style={{ fontSize: "2rem" }}>🎊</span>
                    <span className="font-pixel text-pixel-light" style={{ fontSize: "0.4rem", letterSpacing: "0.08em" }}>
                      ALL DONE!
                    </span>
                  </div>
                ) : (
                  domeCapsules.map((c, i) => (
                    <motion.div
                      key={i}
                      className={`pixel-capsule ${c.color} absolute`}
                      style={{ width: c.size, height: c.size, top: c.pos.top, left: c.pos.left, transform: "translate(-50%, -50%)" }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.2 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                    />
                  ))
                )}
                {/* Dome shine */}
                <div className="absolute bg-white opacity-15 rounded-full" style={{ width: 50, height: 50, top: 10, left: 16 }} />
              </div>
            </div>

            {/* Neck */}
            <div
              className="mx-auto bg-pixel-pink"
              style={{ width: 44, height: 10, borderLeft: "4px solid #3d1a35", borderRight: "4px solid #3d1a35" }}
            />

            {/* Lower body */}
            <div className="px-3 pb-3">
              {/* Coin slot */}
              <div className="flex justify-center mb-2">
                <div className="bg-pixel-dark2 flex items-center justify-center"
                  style={{ width: 60, height: 8, border: "2px solid #3d1a35" }}>
                  <div className="bg-pixel-yellow" style={{ width: 10, height: 4 }} />
                </div>
              </div>

              {/* Dispense slot */}
              <div
                className="bg-pixel-dark2 relative overflow-hidden flex items-center justify-center"
                style={{ height: 60, border: "3px solid #3d1a35", boxShadow: "inset 2px 2px 0 0 rgba(0,0,0,0.3)" }}
              >
                <AnimatePresence>
                  {droppedCapsule && (
                    <motion.button
                      key={droppedCapsule.id}
                      className={`pixel-capsule capsule-flat-${droppedCapsule.color} cursor-pointer`}
                      style={{ width: 44, height: 44 }}
                      initial={{ y: -80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      onClick={() => setShowReveal(true)}
                      title="Open capsule"
                    />
                  )}
                </AnimatePresence>
                {!droppedCapsule && (
                  <span className="font-pixel text-pixel-bg2 opacity-60" style={{ fontSize: "0.35rem" }}>
                    {isEmpty ? "✓ DONE" : "SLOT"}
                  </span>
                )}
              </div>

              {/* Turn button (mobile-friendly) */}
              <motion.button
                className={`pixel-btn w-full mt-3 ${isEmpty ? "bg-pixel-bg2 opacity-50 cursor-not-allowed" : "bg-pixel-pink2 text-pixel-light"}`}
                onClick={handleTurn}
                disabled={isTurning || isEmpty}
                whileTap={!isEmpty ? { x: 4, y: 4, boxShadow: "0 0 0 0 #3d1a35" } : {}}
                style={isEmpty ? { boxShadow: "none", cursor: "not-allowed" } : {}}
              >
                {isTurning ? "TURNING..." : isEmpty ? "ALL DONE!" : "TURN  ↻"}
              </motion.button>
            </div>
          </div>

          {/* ── Handle (right side) ────────────────────── */}
          <div className="mt-12">
            <Handle
              rotation={handleRotation}
              disabled={isTurning || isEmpty}
              onTurn={handleTurn}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReveal && droppedCapsule && (
          <CapsuleReveal capsule={droppedCapsule} onClose={handleCloseReveal} />
        )}
      </AnimatePresence>
    </>
  );
}
