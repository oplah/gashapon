"use client";

import { motion } from "framer-motion";

interface HandleProps {
  rotation: number;
  disabled: boolean;
  onTurn: () => void;
}

export function Handle({ rotation, disabled, onTurn }: HandleProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Handle plate (attached to machine side) */}
      <div
        className="relative bg-pixel-pink2 flex items-center justify-center"
        style={{
          width: 28,
          height: 72,
          border: "3px solid #3d1a35",
          borderLeft: "none",
          boxShadow: "4px 4px 0 0 #3d1a35",
        }}
      >
        {/* Rotating crank arm */}
        <motion.button
          onClick={onTurn}
          disabled={disabled}
          animate={{ rotate: rotation }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ originX: "50%", originY: "50%", width: 22, height: 22, position: "relative" }}
          className={`focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          title="Turn the handle"
          aria-label="Turn capsule machine handle"
        >
          {/* Arm bar */}
          <div
            className="absolute bg-pixel-pink"
            style={{
              width: 4,
              height: 22,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: "2px solid #3d1a35",
            }}
          />
          {/* Knob at top of arm */}
          <div
            className="absolute bg-pixel-light"
            style={{
              width: 12,
              height: 12,
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              border: "2px solid #3d1a35",
              boxShadow: "2px 2px 0 0 #3d1a35",
            }}
          />
        </motion.button>
      </div>

      {/* "TURN" label below handle */}
      {!disabled && (
        <div
          className="font-pixel text-pixel-dark text-center"
          style={{ fontSize: "0.32rem", letterSpacing: "0.06em", lineHeight: 1.6 }}
        >
          TURN
        </div>
      )}
    </div>
  );
}
