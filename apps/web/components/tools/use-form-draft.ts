"use client";

import { useEffect, useRef, useState } from "react";
import type {
  FieldValues,
  UseFormWatch,
  UseFormReset,
} from "react-hook-form";

/**
 * Draft persistence for the free tools.
 *
 * Persists in-progress form state to `sessionStorage` (never to a server) so a
 * refresh or accidental navigation does not wipe out twenty fields of typing.
 * Restored on mount, cleared on successful generation or via "Start afresh".
 *
 * The storage layer is factored into small pure helpers so it can be unit
 * tested without a DOM.
 */

const KEY_PREFIX = "kestrel:draft:";
const DEFAULT_DEBOUNCE_MS = 500;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Build the namespaced storage key for a tool. */
export function draftStorageKey(tool: string): string {
  return `${KEY_PREFIX}${tool}`;
}

/** Safely resolve sessionStorage; returns null during SSR or when unavailable. */
function getSessionStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    return window.sessionStorage;
  } catch {
    // Access can throw in privacy modes / sandboxed iframes.
    return null;
  }
}

/** Read and parse a persisted draft. Returns null when absent or corrupt. */
export function readDraft<T = unknown>(
  key: string,
  storage: StorageLike | null = getSessionStorage(),
): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Serialise and persist a draft. Silently no-ops if storage is unavailable. */
export function writeDraft(
  key: string,
  value: unknown,
  storage: StorageLike | null = getSessionStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota errors etc. — a lost draft is non-fatal.
  }
}

/** Remove a persisted draft. */
export function clearDraft(
  key: string,
  storage: StorageLike | null = getSessionStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Consider a draft "meaningful" only if it differs from the pristine defaults,
 * so we do not show a "Draft restored" notice for an untouched form.
 */
export function isMeaningfulDraft(
  draft: unknown,
  defaults: unknown,
): boolean {
  if (draft == null) return false;
  try {
    return JSON.stringify(draft) !== JSON.stringify(defaults);
  } catch {
    return true;
  }
}

interface UseFormDraftOptions<T extends FieldValues> {
  /** Unique tool key, e.g. "contract-freelancer". */
  tool: string;
  watch: UseFormWatch<T>;
  reset: UseFormReset<T>;
  /** Pristine defaults, used to detect a meaningful draft and to reset. */
  defaultValues: T;
  /** Disable persistence entirely (e.g. after generation). Defaults to true. */
  enabled?: boolean;
  debounceMs?: number;
}

export interface UseFormDraftResult {
  /** True when a meaningful draft was restored on mount. */
  restored: boolean;
  /** Dismiss the "Draft restored" notice without clearing the draft. */
  dismissRestoredNotice: () => void;
  /** Clear the draft and reset the form to its pristine defaults. */
  startAfresh: () => void;
  /** Clear the persisted draft (call on successful generation). */
  clear: () => void;
}

export function useFormDraft<T extends FieldValues>({
  tool,
  watch,
  reset,
  defaultValues,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseFormDraftOptions<T>): UseFormDraftResult {
  const key = draftStorageKey(tool);
  const [restored, setRestored] = useState(false);
  const loadedRef = useRef(false);
  const defaultsRef = useRef(defaultValues);

  // Restore once on mount.
  useEffect(() => {
    const saved = readDraft<T>(key);
    if (saved && isMeaningfulDraft(saved, defaultsRef.current)) {
      reset(saved, { keepDefaultValues: true });
      setRestored(true);
    }
    loadedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change (debounced) once the initial load has settled.
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const subscription = watch((value) => {
      if (!loadedRef.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => writeDraft(key, value), debounceMs);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, key, enabled, debounceMs]);

  function dismissRestoredNotice() {
    setRestored(false);
  }

  function clear() {
    clearDraft(key);
  }

  function startAfresh() {
    clearDraft(key);
    reset(defaultsRef.current);
    setRestored(false);
  }

  return { restored, dismissRestoredNotice, startAfresh, clear };
}
