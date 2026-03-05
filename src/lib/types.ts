// ============================================================
// Core domain types for Gashapon
// ============================================================

export type CapsuleType = "text" | "image" | "link" | "quote";

export type CapsuleColor = "blush" | "mint" | "lavender" | "peach" | "sky";

export type MachineTheme = "default" | "blush" | "mint" | "lavender" | "peach" | "sky";

// ── Content shapes ──────────────────────────────────────────

export interface TextContent {
  message: string;
}

export interface ImageContent {
  url: string;
  caption?: string;
}

export interface LinkContent {
  url: string;
  label: string;
  preview?: string;
}

export interface QuoteContent {
  text: string;
  author?: string;
}

export type CapsuleContent = TextContent | ImageContent | LinkContent | QuoteContent;

// ── Database row types ──────────────────────────────────────

export interface Machine {
  id: string;
  title: string;
  description: string | null;
  theme: MachineTheme;
  creator_name: string | null;
  receiver_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Capsule {
  id: string;
  machine_id: string;
  type: CapsuleType;
  content: CapsuleContent;
  color: CapsuleColor;
  opened: boolean;
  opened_at: string | null;
  sort_order: number;
  created_at: string;
}

// ── Form / UI types ─────────────────────────────────────────

export interface CreateMachineInput {
  title: string;
  description?: string;
  theme?: MachineTheme;
  creator_name?: string;
  receiver_name?: string;
}

export interface CreateCapsuleInput {
  machine_id: string;
  type: CapsuleType;
  content: CapsuleContent;
  color?: CapsuleColor;
  sort_order?: number;
}

// ── Theme config (used by components) ──────────────────────

export interface ThemeConfig {
  label: string;
  bg: string;
  machine: string;
  capsule: string;
  button: string;
  text: string;
  border: string;
}

export const THEMES: Record<MachineTheme, ThemeConfig> = {
  default: {
    label: "Cozy Cream",
    bg: "bg-cream-200",
    machine: "bg-warm-100",
    capsule: "bg-blush-200",
    button: "bg-blush-300 hover:bg-blush-400",
    text: "text-warm-900",
    border: "border-warm-200",
  },
  blush: {
    label: "Rosy Blush",
    bg: "bg-blush-100",
    machine: "bg-blush-200",
    capsule: "bg-blush-300",
    button: "bg-blush-400 hover:bg-blush-400",
    text: "text-warm-900",
    border: "border-blush-200",
  },
  mint: {
    label: "Fresh Mint",
    bg: "bg-mint-100",
    machine: "bg-mint-200",
    capsule: "bg-mint-300",
    button: "bg-mint-300 hover:bg-mint-200",
    text: "text-warm-900",
    border: "border-mint-200",
  },
  lavender: {
    label: "Soft Lavender",
    bg: "bg-lavender-100",
    machine: "bg-lavender-200",
    capsule: "bg-lavender-300",
    button: "bg-lavender-300 hover:bg-lavender-200",
    text: "text-warm-900",
    border: "border-lavender-200",
  },
  peach: {
    label: "Warm Peach",
    bg: "bg-peach-100",
    machine: "bg-peach-200",
    capsule: "bg-peach-300",
    button: "bg-peach-300 hover:bg-peach-200",
    text: "text-warm-900",
    border: "border-peach-200",
  },
  sky: {
    label: "Dreamy Sky",
    bg: "bg-sky-100",
    machine: "bg-sky-200",
    capsule: "bg-sky-300",
    button: "bg-sky-300 hover:bg-sky-200",
    text: "text-warm-900",
    border: "border-sky-200",
  },
};

export const CAPSULE_COLORS: Record<CapsuleColor, { bg: string; border: string; shine: string }> = {
  blush: { bg: "bg-blush-300", border: "border-blush-400", shine: "bg-blush-100" },
  mint: { bg: "bg-mint-300", border: "border-mint-200", shine: "bg-mint-100" },
  lavender: { bg: "bg-lavender-300", border: "border-lavender-200", shine: "bg-lavender-100" },
  peach: { bg: "bg-peach-300", border: "border-peach-200", shine: "bg-peach-100" },
  sky: { bg: "bg-sky-300", border: "border-sky-200", shine: "bg-sky-100" },
};
