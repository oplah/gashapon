"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StepIndicator } from "@/components/create/StepIndicator";
import { MachineSetupForm } from "@/components/create/MachineSetupForm";
import { AddCapsuleForm } from "@/components/create/AddCapsuleForm";
import { CapsuleList } from "@/components/create/CapsuleList";
import { AudioControls } from "@/components/ui/AudioControls";
import { createMachine, addCapsule } from "@/lib/supabase";
import { sounds } from "@/lib/sounds";
import type { CreateMachineInput, CreateCapsuleInput, Machine } from "@/lib/types";

const STEPS = ["MACHINE", "CAPSULES", "SHARE"];

export default function CreatePage() {
  const [step,             setStep]      = useState(0);
  const [machineInput,     setMInput]    = useState<CreateMachineInput | null>(null);
  const [pendingCapsules,  setPending]   = useState<CreateCapsuleInput[]>([]);
  const [machine,          setMachine]   = useState<Machine | null>(null);
  const [saving,           setSaving]    = useState(false);
  const [error,            setError]     = useState<string | null>(null);
  const [copied,           setCopied]    = useState(false);

  function handleMachineSetup(data: CreateMachineInput) {
    sounds.playSFX("click");
    setMInput(data);
    setStep(1);
  }

  function handleAddCapsule(input: CreateCapsuleInput) {
    sounds.playSFX("click");
    setPending((prev) => [...prev, { ...input, sort_order: prev.length }]);
  }

  function handleRemoveCapsule(index: number) {
    sounds.playSFX("click");
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveMachine() {
    if (!machineInput || pendingCapsules.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createMachine(machineInput);
      await Promise.all(pendingCapsules.map((c, i) => addCapsule({ ...c, machine_id: created.id, sort_order: i })));
      setMachine(created);
      sounds.playSFX("success");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const shareUrl = machine
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/machine/${machine.id}`
    : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      sounds.playSFX("click");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback */ }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="pixel-btn bg-pixel-bg2 text-pixel-dark" style={{ fontSize: "0.42rem", padding: "8px 12px" }}>
              ← BACK
            </button>
          </Link>
          <span className="font-pixel text-pixel-dark" style={{ fontSize: "0.6rem", letterSpacing: "0.06em" }}>
            CREATE
          </span>
          <AudioControls />
        </div>

        <StepIndicator steps={STEPS} current={step} />

        {/* ── Step 0: Machine setup ── */}
        {step === 0 && (
          <div className="pixel-card p-6">
            <h2 className="font-pixel text-pixel-dark mb-5" style={{ fontSize: "0.65rem", lineHeight: 2 }}>
              NAME YOUR MACHINE
            </h2>
            <MachineSetupForm onNext={handleMachineSetup} />
          </div>
        )}

        {/* ── Step 1: Capsules ── */}
        {step === 1 && machineInput && (
          <div className="space-y-4">
            <div className="pixel-card p-6">
              <h2 className="font-pixel text-pixel-dark mb-5" style={{ fontSize: "0.65rem", lineHeight: 2 }}>
                ADD CAPSULES
              </h2>
              <AddCapsuleForm machineId="pending" onAdd={handleAddCapsule} />
            </div>

            <div className="pixel-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-pixel text-pixel-dark" style={{ fontSize: "0.5rem" }}>ADDED</span>
                <div
                  className="font-pixel text-pixel-dark bg-pixel-pink"
                  style={{ border: "2px solid #3d1a35", padding: "3px 10px", fontSize: "0.5rem" }}
                >
                  {pendingCapsules.length}
                </div>
              </div>
              <CapsuleList capsules={pendingCapsules} onRemove={handleRemoveCapsule} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { sounds.playSFX("click"); setStep(0); }}
                className="pixel-btn flex-1 bg-pixel-bg2 text-pixel-dark"
                style={{ fontSize: "0.45rem" }}
              >
                ← BACK
              </button>
              <button
                onClick={handleSaveMachine}
                disabled={pendingCapsules.length === 0 || saving}
                className={`pixel-btn flex-1 text-pixel-light ${pendingCapsules.length > 0 && !saving ? "bg-pixel-pink2" : "bg-pixel-bg2 opacity-50 cursor-not-allowed"}`}
                style={{ fontSize: "0.45rem", boxShadow: pendingCapsules.length === 0 ? "none" : undefined }}
              >
                {saving ? "SAVING..." : `SAVE  (${pendingCapsules.length})`}
              </button>
            </div>

            {error && (
              <div className="pixel-card p-3 text-center" style={{ borderColor: "#e87a9e" }}>
                <p className="text-sm text-pixel-dark font-sans">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Share ── */}
        {step === 2 && machine && (
          <motion.div
            className="pixel-card p-6 text-center space-y-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-5xl">🎊</div>
            <div>
              <p className="font-pixel text-pixel-dark leading-loose" style={{ fontSize: "0.65rem" }}>MACHINE READY!</p>
              <p className="text-sm text-pixel-dark opacity-70 font-sans mt-2">
                Share this link with <strong>{machine.receiver_name || "someone special"}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-pixel-bg2 p-3 text-left" style={{ border: "3px solid #3d1a35" }}>
                <p className="font-mono text-xs text-pixel-dark break-all">{shareUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`pixel-btn w-full ${copied ? "bg-pixel-mint text-pixel-dark" : "bg-pixel-pink2 text-pixel-light"}`}
                style={{ fontSize: "0.5rem" }}
              >
                {copied ? "✓ COPIED!" : "COPY LINK"}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/machine/${machine.id}`}>
                <button className="pixel-btn w-full bg-pixel-purple text-pixel-light" style={{ fontSize: "0.45rem" }}>
                  PREVIEW MACHINE →
                </button>
              </Link>
              <button
                onClick={() => { setStep(0); setMInput(null); setPending([]); setMachine(null); }}
                className="text-xs text-pixel-dark opacity-50 hover:opacity-80 py-2 font-sans transition-opacity"
              >
                Create another machine
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
