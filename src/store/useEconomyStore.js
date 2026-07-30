import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Baseline Rarity Exchange Rate
export const EXCHANGE_RATES = {
  // Common cards
  'C': { dismantle: 5, craft: 25 },
  // Uncommon cards
  'U': { dismantle: 10, craft: 50 },
  // Rare cards
  'R': { dismantle: 30, craft: 150 },
  // Double Rare
  'RR': { dismantle: 100, craft: 500 },
  // Super Rare
  'SR': { dismantle: 300, craft: 1500 },
  // Ultra Rare / Our Ultra Rare / Holographic Rare
  'UR': { dismantle: 800, craft: 4000 },
  'OUR': { dismantle: 1000, craft: 5000 },
  'HR': { dismantle: 1000, craft: 5000 },
  // Secret
  'SEC': { dismantle: 2500, craft: 15000 },
  // Promo / Starter
  'PR': { dismantle: 10, craft: 100 },
  'OSR': { dismantle: 300, craft: 1500 },
  // Cheer / SY / S
  'Cheer': { dismantle: 1, craft: 5 },
  'S': { dismantle: 5, craft: 25 },
  'SY': { dismantle: 5, craft: 25 },
};

export const getRatesForRarity = (rarity) => {
  return EXCHANGE_RATES[rarity] || { dismantle: 5, craft: 50 }; // Fallback
};

export const useEconomyStore = create(
  persist(
    (set, get) => ({
      holoShards: 0,
      
      addShards: (amount) => set((state) => ({ 
        holoShards: state.holoShards + amount 
      })),
      
      spendShards: (amount) => {
        const current = get().holoShards;
        if (current >= amount) {
          set({ holoShards: current - amount });
          return true; // Success
        }
        return false; // Insufficient funds
      },
      
      resetEconomy: () => set({ holoShards: 0 })
    }),
    {
      name: 'holo-economy-storage'
    }
  )
);
