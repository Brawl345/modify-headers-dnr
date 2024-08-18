import { writable } from 'svelte/store';
import { defaultOptions, getOptions, newRule } from '../../storage';
import type { Options } from '../../types';

const createStore = () => {
  const { subscribe, set, update } = writable<Options>(
    structuredClone(defaultOptions),
  );

  return {
    set,
    subscribe,
    resetAll: () => set(structuredClone(defaultOptions)),
    addRule: () =>
      update((previous) => ({
        ...previous,
        rules: [...previous.rules, { ...newRule }],
      })),
    removeRule: (indexToRemove: number) =>
      update((previous) => ({
        ...previous,
        rules: previous.rules.filter((_, i) => i !== indexToRemove),
      })),
    resetRules: () =>
      update((previous) => ({
        ...previous,
        rules: defaultOptions.rules.map((p) => ({
          ...p,
        })),
      })),
    loadFromStorage: async () => set(await getOptions()),
  };
};

export const options = createStore();
