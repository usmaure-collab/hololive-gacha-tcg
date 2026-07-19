export const EXPANSIONS = {
  hBP01: "Booster Pack 1: Blooming Radiance",
  hBP02: "Booster Pack 2: Quintet Spectrum",
  hBP03: "Booster Pack 3: Elite Spark",
  hBP04: "Booster Pack 4: Curious Universe",
  hBP05: "Booster Pack 5: Enchant Regalia",
  hBP06: "Booster Pack 6: Ayakashi Vermilion",
  hSD: "Start Decks",
  hY: "Start Cheer Set"
};

export const getExpansionName = (id) => {
  return EXPANSIONS[id] || id;
};
