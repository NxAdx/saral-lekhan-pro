import { AppLanguage } from '../store/settingsStore';
import { getStrings } from './index';

/**
 * Migration Bridge:
 * This file now points to the scalable JSON-based locales in ./locales
 * To maintain compatibility with existing components using strings[lang],
 * we use a Proxy.
 */
export const strings = new Proxy({}, {
  get(_, lang: string) {
    return getStrings(lang);
  }
}) as Record<AppLanguage, any>;

export type { AppStrings } from './index'; // If we add types there later
