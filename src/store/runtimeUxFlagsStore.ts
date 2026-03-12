import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { log } from '../utils/Logger';

export interface RuntimeUxFlags {
  spark_loading_modal_v1: boolean;
  spark_loading_animation_v1: boolean;
}

type RuntimeFlagSource = 'default' | 'cache' | 'remote';

interface RuntimeUxFlagsState {
  flags: RuntimeUxFlags;
  loaded: boolean;
  source: RuntimeFlagSource;
  fetchedAt: number | null;
  loadFlags: () => Promise<void>;
  resetToDefaults: () => void;
}

interface StoredFlagPayload {
  flags: RuntimeUxFlags;
  fetchedAt: number;
}

const STORAGE_KEY = 'saral-lekhan-runtime-ux-flags-v1';
const FETCH_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 2500;

export const DEFAULT_RUNTIME_UX_FLAGS: RuntimeUxFlags = {
  spark_loading_modal_v1: true,
  spark_loading_animation_v1: true,
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseFlag = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const mergeFlags = (base: RuntimeUxFlags, incoming: unknown): RuntimeUxFlags => {
  if (!isObjectRecord(incoming)) return base;
  return {
    spark_loading_modal_v1: parseFlag(incoming.spark_loading_modal_v1, base.spark_loading_modal_v1),
    spark_loading_animation_v1: parseFlag(incoming.spark_loading_animation_v1, base.spark_loading_animation_v1),
  };
};

const getRuntimeFlagsUrl = (): string => {
  const expoConfigExtra = (Constants.expoConfig as any)?.extra;
  const legacyExtra = (Constants.manifest as any)?.extra;
  return String(expoConfigExtra?.runtimeFlagsUrl || legacyExtra?.runtimeFlagsUrl || '').trim();
};

const fetchWithTimeout = async (url: string, timeoutMs: number): Promise<Response> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Runtime flag fetch timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return (await Promise.race([
    fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
    }),
    timeoutPromise,
  ])) as Response;
};

export const useRuntimeUxFlagsStore = create<RuntimeUxFlagsState>()((set, get) => ({
  flags: DEFAULT_RUNTIME_UX_FLAGS,
  loaded: false,
  source: 'default',
  fetchedAt: null,
  loadFlags: async () => {
    const now = Date.now();
    const current = get();
    if (current.loaded && current.fetchedAt && now - current.fetchedAt < FETCH_TTL_MS) {
      return;
    }

    let cacheFetchedAt: number | null = null;
    try {
      const cachedRaw = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedRaw) {
        const payload = JSON.parse(cachedRaw) as StoredFlagPayload;
        const merged = mergeFlags(DEFAULT_RUNTIME_UX_FLAGS, payload?.flags);
        cacheFetchedAt = typeof payload?.fetchedAt === 'number' ? payload.fetchedAt : null;
        set({
          flags: merged,
          loaded: true,
          source: 'cache',
          fetchedAt: cacheFetchedAt,
        });
      }
    } catch (error) {
      log.warn('Runtime UX flags cache read failed. Using defaults.', error as any);
    }

    const runtimeFlagsUrl = getRuntimeFlagsUrl();
    if (!runtimeFlagsUrl) {
      if (!get().loaded) {
        set({
          flags: DEFAULT_RUNTIME_UX_FLAGS,
          loaded: true,
          source: 'default',
          fetchedAt: null,
        });
      }
      return;
    }

    if (cacheFetchedAt && now - cacheFetchedAt < FETCH_TTL_MS) {
      return;
    }

    try {
      const response = await fetchWithTimeout(runtimeFlagsUrl, FETCH_TIMEOUT_MS);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as unknown;
      const merged = mergeFlags(DEFAULT_RUNTIME_UX_FLAGS, payload);
      const nextFetchedAt = Date.now();

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          flags: merged,
          fetchedAt: nextFetchedAt,
        } satisfies StoredFlagPayload)
      );

      set({
        flags: merged,
        loaded: true,
        source: 'remote',
        fetchedAt: nextFetchedAt,
      });
      log.info('Runtime UX flags loaded from remote source.', merged);
    } catch (error) {
      if (!get().loaded) {
        set({
          flags: DEFAULT_RUNTIME_UX_FLAGS,
          loaded: true,
          source: 'default',
          fetchedAt: null,
        });
      }
      log.warn('Runtime UX flags remote fetch failed. Keeping cached/default values.', error as any);
    }
  },
  resetToDefaults: () =>
    set({
      flags: DEFAULT_RUNTIME_UX_FLAGS,
      loaded: true,
      source: 'default',
      fetchedAt: null,
    }),
}));

export const useRuntimeUxFlag = (key: keyof RuntimeUxFlags) =>
  useRuntimeUxFlagsStore((state) => state.flags[key]);
