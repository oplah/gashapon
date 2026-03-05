import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Machine, Capsule, CreateMachineInput, CreateCapsuleInput } from "./types";

// Lazy singleton — only instantiated when first called (not at module load time).
// This prevents build-time errors when env vars are not set during static prerendering.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing Supabase env vars. Copy .env.example to .env.local and fill in your project values."
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}

// ── Machines ────────────────────────────────────────────────

export async function createMachine(input: CreateMachineInput): Promise<Machine> {
  const { data, error } = await getClient()
    .from("machines")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Machine;
}

export async function getMachine(id: string): Promise<Machine | null> {
  const { data, error } = await getClient()
    .from("machines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Machine;
}

// ── Capsules ────────────────────────────────────────────────

export async function addCapsule(input: CreateCapsuleInput): Promise<Capsule> {
  const { data, error } = await getClient()
    .from("capsules")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Capsule;
}

export async function getCapsules(machineId: string): Promise<Capsule[]> {
  const { data, error } = await getClient()
    .from("capsules")
    .select("*")
    .eq("machine_id", machineId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Capsule[];
}

export async function getUnopenedCapsule(machineId: string): Promise<Capsule | null> {
  const { data, error } = await getClient()
    .from("capsules")
    .select("*")
    .eq("machine_id", machineId)
    .eq("opened", false)
    .order("sort_order", { ascending: true })
    .limit(1)
    .single();

  if (error) return null;
  return data as Capsule;
}

export async function markCapsuleOpened(capsuleId: string): Promise<void> {
  const { error } = await getClient()
    .from("capsules")
    .update({ opened: true, opened_at: new Date().toISOString() })
    .eq("id", capsuleId);

  if (error) throw error;
}

export async function deleteCapsule(capsuleId: string): Promise<void> {
  const { error } = await getClient()
    .from("capsules")
    .delete()
    .eq("id", capsuleId);

  if (error) throw error;
}

// ── Storage ─────────────────────────────────────────────────

export async function uploadCapsuleImage(file: File, machineId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${machineId}/${Date.now()}.${ext}`;

  const { error } = await getClient().storage
    .from("capsule-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = getClient().storage
    .from("capsule-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

// Upload from the create flow before a machine ID exists.
// Files land in uploads/ — acceptable for MVP.
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const uid = Math.random().toString(36).slice(2, 10);
  const path = `uploads/${Date.now()}-${uid}.${ext}`;

  const { error } = await getClient().storage
    .from("capsule-images")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = getClient().storage
    .from("capsule-images")
    .getPublicUrl(path);

  return data.publicUrl;
}
