/**
 * CacheService — Stale-While-Revalidate cache for API data.
 * 
 * Stores fetched data in sessionStorage with timestamps.
 * Pages show cached data instantly, then refresh from API in background.
 */

const CACHE_PREFIX = 'jvtaxi_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — after this, data is "stale" but still shown

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Get cached data. Returns null if no cache exists.
 */
export function getCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Set data into cache with current timestamp.
 */
export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — ignore silently
  }
}

/**
 * Check if cache is still fresh (within TTL).
 */
export function isCacheFresh(key: string): boolean {
  try {
    const raw = sessionStorage.getItem(getCacheKey(key));
    if (!raw) return false;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return (Date.now() - entry.timestamp) < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

/**
 * Remove specific cache entry.
 */
export function clearCache(key: string): void {
  sessionStorage.removeItem(getCacheKey(key));
}

/**
 * Clear all JV-Taxi cache entries (useful on logout).
 */
export function clearAllCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k && k.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => sessionStorage.removeItem(k));
}

// ── Predefined cache keys ──
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  DRIVER_PROFILE: 'driver_profile',
  TRIP_HISTORY_STATE: 'trip_history_state',
} as const;
