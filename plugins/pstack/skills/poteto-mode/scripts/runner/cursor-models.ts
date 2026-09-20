import type { Effort } from "./types.ts";
import { UnavailableModelError } from "./types.ts";

export interface CursorModel {
  readonly id: string;
  readonly displayName: string;
}

// Cursor bakes reasoning effort and the fast tier into the model id and reports
// the served model only as a display name, so one table owns both spellings of
// every selectable row. The portable model name carries the speed tier: Cursor
// bills its Fast ids at a higher token rate, and a background lane gains
// nothing from that priority. Cursor offers no Grok 4.6 row above xhigh.
const CURSOR_MODELS: Readonly<
  Record<string, Readonly<Partial<Record<Effort, CursorModel>>>>
> = {
  "grok-4.6": {
    low: {
      id: "cursor-grok-4.6-low",
      displayName: "Cursor Grok 4.6 Low",
    },
    medium: {
      id: "cursor-grok-4.6-medium",
      displayName: "Cursor Grok 4.6 Medium",
    },
    high: {
      id: "cursor-grok-4.6-high",
      displayName: "Cursor Grok 4.6",
    },
    xhigh: {
      id: "cursor-grok-4.6-xhigh",
      displayName: "Cursor Grok 4.6 Extra High",
    },
  },
  "grok-4.6-fast": {
    low: {
      id: "cursor-grok-4.6-low-fast",
      displayName: "Cursor Grok 4.6 Low Fast",
    },
    medium: {
      id: "cursor-grok-4.6-medium-fast",
      displayName: "Cursor Grok 4.6 Medium Fast",
    },
    high: {
      id: "cursor-grok-4.6-high-fast",
      displayName: "Cursor Grok 4.6 Fast",
    },
    xhigh: {
      id: "cursor-grok-4.6-xhigh-fast",
      displayName: "Cursor Grok 4.6 Extra High Fast",
    },
  },
};

export function cursorModel(model: string, effort: Effort): CursorModel {
  const row = CURSOR_MODELS[model]?.[effort];
  if (row === undefined) {
    throw new UnavailableModelError(
      `cursor does not offer ${model} at effort ${effort}`
    );
  }
  return row;
}
