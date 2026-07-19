import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDeckStore = create(
  persist(
    (set, get) => ({
      decks: [],
      activeDeckId: null,
      
      createDeck: (name) => set((state) => {
        const newDeck = {
          id: Date.now().toString(),
          name,
          oshi: null,
          main: {}, // cardId -> count
          cheer: {}, // cardId -> count
        };
        return { 
          decks: [...state.decks, newDeck],
          activeDeckId: state.activeDeckId || newDeck.id
        };
      }),
      
      setActiveDeck: (deckId) => set({ activeDeckId: deckId }),
      
      updateDeck: (deckId, deckData) => set((state) => ({
        decks: state.decks.map(d => d.id === deckId ? { ...d, ...deckData } : d)
      })),
      
      deleteDeck: (deckId) => set((state) => ({
        decks: state.decks.filter(d => d.id !== deckId),
        activeDeckId: state.activeDeckId === deckId ? null : state.activeDeckId
      })),

      getActiveDeck: () => {
        const state = get();
        return state.decks.find(d => d.id === state.activeDeckId) || null;
      }
    }),
    {
      name: 'hololive-deck-storage',
    }
  )
);
