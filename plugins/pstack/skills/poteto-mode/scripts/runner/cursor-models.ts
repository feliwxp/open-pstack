import type { Effort } from "./types.ts";
import { UnavailableModelError } from "./types.ts";

export interface CursorModel {
  readonly id: string;
  readonly displayNames: readonly [string, ...string[]];
}

// Cursor bakes reasoning effort and the fast tier into the model id and reports
// the served model only as a display name, so one table owns both spellings of
// every selectable row. The portable model name carries the speed tier: Cursor
// bills its Fast ids at a higher token rate, and a background lane gains
// nothing from that priority. Cursor offers no Grok row above xhigh. Grok 4.7
// ids drop the `cursor-` prefix that Grok 4.6 ids carry. A Grok 4.7 row has two
// names, and Cursor's stream reports either: the "256K" form seen on 2026-09-23,
// and the `cursor-agent models` listing form with that slot blank, seen by lanes
// from 2026-09-30. The Fast names are the standard name plus " Fast", as the
// listing shows; they were not run live because Fast bills at a higher rate, so
// a wrong guess fails its lane loudly as malformed-output.
const CURSOR_MODELS: Readonly<
  Record<string, Readonly<Partial<Record<Effort, CursorModel>>>>
> = {
  "grok-4.7": {
    low: {
      id: "grok-4.7-low",
      displayNames: ["Grok 4.7 256K Low", "Grok 4.7  Low"],
    },
    medium: {
      id: "grok-4.7-medium",
      displayNames: ["Grok 4.7 256K Medium", "Grok 4.7  Medium"],
    },
    high: {
      id: "grok-4.7-high",
      displayNames: ["Grok 4.7 256K High", "Grok 4.7  High"],
    },
    xhigh: {
      id: "grok-4.7-xhigh",
      displayNames: ["Grok 4.7 256K Extra High", "Grok 4.7  Extra High"],
    },
  },
  "grok-4.7-fast": {
    low: {
      id: "grok-4.7-low-fast",
      displayNames: ["Grok 4.7 256K Low Fast", "Grok 4.7  Low Fast"],
    },
    medium: {
      id: "grok-4.7-medium-fast",
      displayNames: ["Grok 4.7 256K Medium Fast", "Grok 4.7  Medium Fast"],
    },
    high: {
      id: "grok-4.7-high-fast",
      displayNames: ["Grok 4.7 256K High Fast", "Grok 4.7  High Fast"],
    },
    xhigh: {
      id: "grok-4.7-xhigh-fast",
      displayNames: ["Grok 4.7 256K Extra High Fast", "Grok 4.7  Extra High Fast"],
    },
  },
  "grok-4.6": {
    low: {
      id: "cursor-grok-4.6-low",
      displayNames: ["Grok 4.6 Low"],
    },
    medium: {
      id: "cursor-grok-4.6-medium",
      displayNames: ["Grok 4.6 Medium"],
    },
    high: {
      id: "cursor-grok-4.6-high",
      displayNames: ["Grok 4.6"],
    },
    xhigh: {
      id: "cursor-grok-4.6-xhigh",
      displayNames: ["Grok 4.6 Extra High"],
    },
  },
  "grok-4.6-fast": {
    low: {
      id: "cursor-grok-4.6-low-fast",
      displayNames: ["Grok 4.6 Low Fast"],
    },
    medium: {
      id: "cursor-grok-4.6-medium-fast",
      displayNames: ["Grok 4.6 Medium Fast"],
    },
    high: {
      id: "cursor-grok-4.6-high-fast",
      displayNames: ["Grok 4.6 Fast"],
    },
    xhigh: {
      id: "cursor-grok-4.6-xhigh-fast",
      displayNames: ["Grok 4.6 Extra High Fast"],
    },
  },
};

// Cursor pads some Grok 4.7 names with a double space, and its listing ends
// every Grok 4.7 Fast name with two U+200B characters. Strip zero-width
// characters, collapse whitespace runs, and trim, so padding never decides a
// match and every word still does.
function normalizedDisplayName(name: string): string {
  return name.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}

export function reportsCursorModel(reported: string, row: CursorModel): boolean {
  const name = normalizedDisplayName(reported);
  return row.displayNames.some((registered) => normalizedDisplayName(registered) === name);
}

export function cursorModel(model: string, effort: Effort): CursorModel {
  const row = CURSOR_MODELS[model]?.[effort];
  if (row === undefined) {
    throw new UnavailableModelError(
      `cursor does not offer ${model} at effort ${effort}`
    );
  }
  return row;
}
