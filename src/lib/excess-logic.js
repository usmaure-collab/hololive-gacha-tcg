/**
 * Calculates the number of excess cards a user owns beyond the playable limit.
 * Oshi: max 1
 * Cheer: max 20
 * Standard: max 4
 * 
 * @param {Object} card - The card object from the database.
 * @param {number} ownedCount - The total number of this card the user owns.
 * @returns {number} The number of excess copies (0 if not in excess).
 */
export const calculateExcess = (card, ownedCount) => {
  if (!card) return 0;
  
  let limit = 4; // Default for Holomems, Supports, Items, etc.
  
  if (card.card_type === 'Oshi') {
    limit = 1;
  } else if (card.card_type === 'Cheer') {
    limit = 20;
  }

  const excess = ownedCount - limit;
  return excess > 0 ? excess : 0;
};
