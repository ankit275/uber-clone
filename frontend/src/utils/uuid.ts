/**
 * Utility for generating UUIDs and idempotent keys
 */

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateIdempotentKey(): string {
  return generateUUID();
}

// Store idempotent keys for tracking
const idempotentKeys = new Map<string, boolean>();

export function trackIdempotentKey(key: string): void {
  idempotentKeys.set(key, true);
}

export function hasIdempotentKey(key: string): boolean {
  return idempotentKeys.has(key);
}
