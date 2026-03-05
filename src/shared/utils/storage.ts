import type { ZodType } from "zod";

/**
 * Safely read from localStorage with Zod schema validation.
 * Returns fallback if key doesn't exist, data is corrupted, or fails validation.
 */
export function loadFromStorage<T>(key: string, schema: ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);

    if (result.success) return result.data;

    console.warn(`[storage] Invalid data for "${key}", using fallback.`);
    return fallback;
  } catch {
    console.warn(`[storage] Failed to read "${key}", using fallback.`);
    return fallback;
  }
}

/**
 * Safely write to localStorage with quota handling.
 */
export function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn(`[storage] Quota exceeded for "${key}". Data not saved.`);
    } else {
      console.warn(`[storage] Failed to save "${key}".`);
    }
  }
}
