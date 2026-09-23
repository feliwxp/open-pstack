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
// nothing from that priority. Cursor offers no Grok row above xhigh. Grok 4.7
// ids drop the `cursor-` prefix that Grok 4.6 ids carry. Display names are
// stored normalized; `displayNamesMatch` owns the comparison.
const CURSOR_MODELS: Readonly<
  Record<string, Readonly<Partial<Record<Effort, CursorModel>>>>
> = {
  "grok-4.7": {
    low: {
      id: "grok-4.7-low",
      displayName: "Grok 4.7 Low",
    },
    medium: {
      id: "grok-4.7-medium",
      displayName: "Grok 4.7 Medium",
    },
    high: {
      id: "grok-4.7-high",
      displayName: "Grok 4.7 High",
    },
    xhigh: {
      id: "grok-4.7-xhigh",
      displayName: "Grok 4.7 Extra High",
    },
  },
  "grok-4.7-fast": {
    low: {
      id: "grok-4.7-low-fast",
      displayName: "Grok 4.7 Low Fast",
    },
    medium: {
      id: "grok-4.7-medium-fast",
      displayName: "Grok 4.7 Medium Fast",
    },
    high: {
      id: "grok-4.7-high-fast",
      displayName: "Grok 4.7 High Fast",
    },
    xhigh: {
      id: "grok-4.7-xhigh-fast",
      displayName: "Grok 4.7 Extra High Fast",
    },
  },
  "grok-4.6": {
    low: {
      id: "cursor-grok-4.6-low",
      displayName: "Grok 4.6 Low",
    },
    medium: {
      id: "cursor-grok-4.6-medium",
      displayName: "Grok 4.6 Medium",
    },
    high: {
      id: "cursor-grok-4.6-high",
      displayName: "Grok 4.6",
    },
    xhigh: {
      id: "cursor-grok-4.6-xhigh",
      displayName: "Grok 4.6 Extra High",
    },
  },
  "grok-4.6-fast": {
    low: {
      id: "cursor-grok-4.6-low-fast",
      displayName: "Grok 4.6 Low Fast",
    },
    medium: {
      id: "cursor-grok-4.6-medium-fast",
      displayName: "Grok 4.6 Medium Fast",
    },
    high: {
      id: "cursor-grok-4.6-high-fast",
      displayName: "Grok 4.6 Fast",
    },
    xhigh: {
      id: "cursor-grok-4.6-xhigh-fast",
      displayName: "Grok 4.6 Extra High Fast",
    },
  },
};

// Cursor pads some display names: two spaces after "Grok 4.7", and two U+200B
// characters after every Grok 4.7 Fast name. Strip zero-width characters,
// collapse whitespace runs, and trim, so spacing never decides a match and
// every word still does.
function normalizedDisplayName(name: string): string {
  return name.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}

export function displayNamesMatch(reported: string, registered: string): boolean {
  return normalizedDisplayName(reported) === normalizedDisplayName(registered);
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
