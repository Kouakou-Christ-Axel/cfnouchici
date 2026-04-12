export interface PopularityInput {
  ouiUtilise: number;
  connais: number;
  jamaisEntendu: number;
  exacte: number;
  approximative: number;
  fausse: number;
  totalVotes: number;
  socialScore: number;
}

export const POPULARITY_WEIGHTS = {
  OUI_UTILISE: 3,
  CONNAIS: 1,
  JAMAIS_ENTENDU: -2,
  EXACTE: 2,
  APPROXIMATIVE: 0,
  FAUSSE: -2,
  ENGAGEMENT_MULTIPLIER: 2,
  SOCIAL_MULTIPLIER: 3,
  TEMPORAL_BOOST_PER_DAY: 0.5,
};

export function calculatePopularityScore(input: PopularityInput): number {
  return (
    POPULARITY_WEIGHTS.OUI_UTILISE * input.ouiUtilise +
    POPULARITY_WEIGHTS.CONNAIS * input.connais +
    POPULARITY_WEIGHTS.JAMAIS_ENTENDU * input.jamaisEntendu +
    POPULARITY_WEIGHTS.EXACTE * input.exacte +
    POPULARITY_WEIGHTS.APPROXIMATIVE * input.approximative +
    POPULARITY_WEIGHTS.FAUSSE * input.fausse +
    Math.log(1 + input.totalVotes) * POPULARITY_WEIGHTS.ENGAGEMENT_MULTIPLIER +
    input.socialScore * POPULARITY_WEIGHTS.SOCIAL_MULTIPLIER
  );
}

export function applyTemporalBoost(
  storedScore: number,
  createdAt: Date,
  now: Date = new Date(),
): number {
  const daysPending = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return storedScore + daysPending * POPULARITY_WEIGHTS.TEMPORAL_BOOST_PER_DAY;
}
