import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      credits: 1000,
      devMode: true, // Defaulting to true for Phase 1 testing
      stats: {
        packsOpened: 0,
        cardsPulled: 0,
      },
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      spendCredits: (amount) => {
        if (get().devMode) return true; // Infinite credits
        if (get().credits >= amount) {
          set((state) => ({ credits: state.credits - amount }));
          return true;
        }
        return false;
      },
      toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
      recordPackOpened: (cardsCount) => set((state) => ({
        stats: {
          packsOpened: state.stats.packsOpened + 1,
          cardsPulled: state.stats.cardsPulled + cardsCount
        }
      })),
      resetPlayer: () => set({ credits: 1000, stats: { packsOpened: 0, cardsPulled: 0 } })
    }),
    {
      name: 'hololive-player-storage',
    }
  )
);
