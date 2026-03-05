"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GashaponMachine } from "@/components/gashapon/GashaponMachine";
import { AudioControls } from "@/components/ui/AudioControls";
import { getMachine, getCapsules, getUnopenedCapsule, markCapsuleOpened } from "@/lib/supabase";
import { sounds } from "@/lib/sounds";
import type { Machine, Capsule } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MachinePage({ params }: PageProps) {
  const [machineId, setMachineId] = useState<string | null>(null);
  const [machine,   setMachine]   = useState<Machine | null>(null);
  const [capsules,  setCapsules]  = useState<Capsule[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  const remainingCount = capsules.filter((c) => !c.opened).length;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setMachineId(id);
      const [m, caps] = await Promise.all([getMachine(id), getCapsules(id)]);
      if (!m) { setNotFound(true); setLoading(false); return; }
      setMachine(m);
      setCapsules(caps);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play success jingle when all capsules are opened
  useEffect(() => {
    if (!loading && capsules.length > 0 && remainingCount === 0) {
      sounds.playSFX("success");
    }
  }, [remainingCount, loading, capsules.length]);

  const handleTurnHandle = useCallback(async (): Promise<Capsule | null> => {
    if (!machineId) return null;
    const capsule = await getUnopenedCapsule(machineId);
    if (!capsule) return null;
    await markCapsuleOpened(capsule.id);
    setCapsules((prev) =>
      prev.map((c) => c.id === capsule.id ? { ...c, opened: true, opened_at: new Date().toISOString() } : c)
    );
    return capsule;
  }, [machineId]);

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div className="text-center space-y-4"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <div className="text-4xl">🎪</div>
          <p className="font-pixel text-pixel-dark" style={{ fontSize: "0.55rem", letterSpacing: "0.08em" }}>
            LOADING...
          </p>
        </motion.div>
      </main>
    );
  }

  // ── Not found ──────────────────────────────────────────────
  if (notFound || !machine) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="pixel-card p-8 text-center max-w-sm w-full space-y-4">
          <div className="text-5xl">🔍</div>
          <p className="font-pixel text-pixel-dark" style={{ fontSize: "0.6rem", lineHeight: 2 }}>MACHINE NOT FOUND</p>
          <p className="text-sm text-pixel-dark opacity-70 font-sans">This capsule machine doesn&apos;t exist or the link might be wrong.</p>
          <Link href="/">
            <button className="pixel-btn bg-pixel-pink2 text-pixel-light mt-2">← GO HOME</button>
          </Link>
        </div>
      </main>
    );
  }

  // ── Machine page ───────────────────────────────────────────
  return (
    <main className="min-h-screen py-6 px-4">
      {/* Nav row */}
      <div className="max-w-md mx-auto flex justify-between items-center mb-6">
        <Link href="/">
          <button className="pixel-btn bg-pixel-bg2 text-pixel-dark text-xs py-2 px-3" style={{ fontSize: "0.42rem" }}>
            ← HOME
          </button>
        </Link>
        <AudioControls />
      </div>

      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {machine.receiver_name && (
            <p className="font-pixel text-pixel-dark opacity-60 mb-2" style={{ fontSize: "0.42rem", letterSpacing: "0.08em" }}>
              FOR  {machine.receiver_name.toUpperCase()}  ✦
            </p>
          )}
          <h1 className="font-pixel text-pixel-dark leading-loose" style={{ fontSize: "0.75rem" }}>
            {machine.title}
          </h1>
          {machine.description && (
            <p className="text-pixel-dark font-sans text-sm mt-2 opacity-80 leading-relaxed">{machine.description}</p>
          )}
          {machine.creator_name && (
            <p className="font-pixel text-pixel-dark opacity-50 mt-2" style={{ fontSize: "0.4rem" }}>
              — FROM  {machine.creator_name.toUpperCase()}
            </p>
          )}
        </motion.div>

        {/* Machine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex justify-center"
        >
          <GashaponMachine
            capsuleCount={capsules.length}
            remainingCount={remainingCount}
            theme={machine.theme}
            onTurnHandle={handleTurnHandle}
          />
        </motion.div>

        {/* Hint */}
        {remainingCount > 0 && (
          <motion.p
            className="text-center font-pixel text-pixel-dark opacity-40 mt-6"
            style={{ fontSize: "0.4rem", letterSpacing: "0.08em" }}
            initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
          >
            TURN THE HANDLE TO OPEN A CAPSULE ↑
          </motion.p>
        )}

        {/* All-done card */}
        {remainingCount === 0 && capsules.length > 0 && (
          <motion.div
            className="pixel-card p-6 text-center mt-8 space-y-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="text-4xl">🎊</div>
            <p className="font-pixel text-pixel-dark" style={{ fontSize: "0.6rem", lineHeight: 2 }}>
              YOU OPENED ALL {capsules.length} CAPSULES!
            </p>
            <p className="text-sm text-pixel-dark opacity-70 font-sans">Hope these little surprises made you smile ♥</p>
            {machine.creator_name && (
              <p className="font-pixel text-pixel-dark opacity-50" style={{ fontSize: "0.4rem" }}>
                — {machine.creator_name}
              </p>
            )}
            <Link href="/">
              <button className="pixel-btn bg-pixel-pink text-pixel-dark mt-2" style={{ fontSize: "0.45rem" }}>
                CREATE YOUR OWN
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
