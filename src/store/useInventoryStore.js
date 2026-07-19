import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      collection: {}, // map of cardId -> { count, shiny }
      activeBoxes: {}, // map of expansionId -> array of packs (each pack is an array of cards)
      
      addCardsToCollection: (cardsArray) => set((state) => {
        const newCollection = { ...state.collection };
        cardsArray.forEach(card => {
          if (!newCollection[card.id]) {
            newCollection[card.id] = { count: 0, shiny: 0 };
          }
          newCollection[card.id].count += 1;
        });
        return { collection: newCollection };
      }),
      
      addBox: (expansionId, packsArray) => set((state) => {
        const currentBoxes = state.activeBoxes[expansionId] || [];
        return {
          activeBoxes: {
            ...state.activeBoxes,
            [expansionId]: [...currentBoxes, ...packsArray]
          }
        };
      }),
      
      openPackFromBox: (expansionId) => {
        const state = get();
        const currentBoxes = state.activeBoxes[expansionId];
        if (!currentBoxes || currentBoxes.length === 0) return null;
        
        // Take the first pack from the array
        const pack = currentBoxes[0];
        
        // Remove it from state
        set({
          activeBoxes: {
            ...state.activeBoxes,
            [expansionId]: currentBoxes.slice(1)
          }
        });
        
        return pack;
      },
      
      getCardCount: (cardId) => {
        return get().collection[cardId]?.count || 0;
      },
      
      resetInventory: () => set({ collection: {}, activeBoxes: {} })
    }),
    {
      name: 'hololive-inventory-storage',
    }
  )
);
