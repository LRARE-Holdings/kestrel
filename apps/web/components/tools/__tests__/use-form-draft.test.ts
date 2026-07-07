import { describe, it, expect, beforeEach } from "vitest";
import {
  draftStorageKey,
  readDraft,
  writeDraft,
  clearDraft,
  isMeaningfulDraft,
  type StorageLike,
} from "@/components/tools/use-form-draft";

function createMemoryStorage(): StorageLike & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}

describe("draftStorageKey", () => {
  it("namespaces the tool key", () => {
    expect(draftStorageKey("contract-freelancer")).toBe(
      "kestrel:draft:contract-freelancer",
    );
  });
});

describe("writeDraft / readDraft round-trip", () => {
  let storage: ReturnType<typeof createMemoryStorage>;
  const key = draftStorageKey("test");

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("persists and restores structured values", () => {
    const value = { name: "Jane", nested: { amount: 5000 }, list: ["a", "b"] };
    writeDraft(key, value, storage);
    expect(readDraft(key, storage)).toEqual(value);
  });

  it("returns null when no draft is stored", () => {
    expect(readDraft(key, storage)).toBeNull();
  });

  it("returns null for corrupt JSON rather than throwing", () => {
    storage.setItem(key, "{not json");
    expect(readDraft(key, storage)).toBeNull();
  });

  it("no-ops safely when storage is unavailable", () => {
    expect(() => writeDraft(key, { a: 1 }, null)).not.toThrow();
    expect(readDraft(key, null)).toBeNull();
  });
});

describe("clearDraft", () => {
  it("removes a persisted draft", () => {
    const storage = createMemoryStorage();
    const key = draftStorageKey("test");
    writeDraft(key, { a: 1 }, storage);
    expect(readDraft(key, storage)).not.toBeNull();
    clearDraft(key, storage);
    expect(readDraft(key, storage)).toBeNull();
  });
});

describe("isMeaningfulDraft", () => {
  const defaults = { name: "", amount: undefined, include: true };

  it("is false for a draft identical to the defaults", () => {
    expect(isMeaningfulDraft({ ...defaults }, defaults)).toBe(false);
  });

  it("is false for null/undefined drafts", () => {
    expect(isMeaningfulDraft(null, defaults)).toBe(false);
    expect(isMeaningfulDraft(undefined, defaults)).toBe(false);
  });

  it("is true once the user has changed a field", () => {
    expect(isMeaningfulDraft({ ...defaults, name: "Jane" }, defaults)).toBe(
      true,
    );
  });
});
