import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

interface Alert {
  variant: string | null;
  message: string | null;
}

function createStore() {
  const { subscribe, set }: Writable<Alert> = writable({
    variant: null,
    message: null,
  });

  return {
    subscribe,
    success: (message: string) => {
      set({ variant: 'success', message });
      window.scrollTo(0, 0);
    },
    error: (message: string) => {
      set({ variant: 'danger', message });
      window.scrollTo(0, 0);
    },
    hide: () => set({ variant: null, message: null }),
  };
}

export const alert = createStore();
