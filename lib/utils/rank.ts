export type RankTier = {
  name: string;
  minProjects: number;
  color: string;
  level: number;
};

export const RANK_TIERS: RankTier[] = [
  { name: "ELITE FABRICATOR", minProjects: 20, color: "text-purple-600", level: 5 },
  { name: "MASTER ARCHITECT", minProjects: 10, color: "text-red-600", level: 4 },
  { name: "JOURNEYMAN", minProjects: 5, color: "text-blue-600", level: 3 },
  { name: "APPRENTICE", minProjects: 2, color: "text-green-600", level: 2 },
  { name: "NOVICE SCRAPPER", minProjects: 1, color: "text-yellow-600", level: 1 },
  { name: "INITIATE", minProjects: 0, color: "text-gray-500", level: 0 },
];

export function getRankByProjectCount(count: number): RankTier {
  return RANK_TIERS.find(tier => count >= tier.minProjects) || RANK_TIERS[RANK_TIERS.length - 1];
}

export function getRankProgress(count: number) {
  const currentRank = getRankByProjectCount(count);
  const currentRankIndex = RANK_TIERS.findIndex(r => r.name === currentRank.name);

  if (currentRankIndex === 0) {
    return {
      current: count,
      next: null,
      needed: 0,
      progress: 100,
    };
  }

  const nextRank = RANK_TIERS[currentRankIndex - 1];
  const neededForNext = nextRank.minProjects;

  const progress = Math.min(Math.round((count / neededForNext) * 100), 100);

  return {
    current: count,
    next: nextRank.name,
    needed: neededForNext,
    progress: progress,
  };
}
