import type { Matchup, Team } from './types';

const MEN_ELO_TO_POINTS_BASE = 0.035;
const MEN_ELO_TO_POINTS_PACE_FACTOR = 0.00009;
const MEN_SD_LOGISTIC_BASE = 8.3898;
const MEN_SD_LOGISTIC_TOP = 2.7224;
const MEN_SD_LOGISTIC_SLOPE = 0.0065885;
const MEN_SD_LOGISTIC_CENTER = 772.7603;
const MEN_SD_PACE_BASELINE = 142.6;
const MEN_SD_PACE_WEIGHT = 0.333;
const MEN_T_DF = 19;

function winProbability(teamA: Team, teamB: Team): number {
  const adjustedEloDiff = getAdjustedEloDifference(teamA, teamB);
  const totalPointsForecast = getTotalPointsForecast(teamA, teamB);
  const eloToPointsFactor = getEloToPointsFactor(totalPointsForecast, teamA, teamB);
  const expectedMargin = adjustedEloDiff * eloToPointsFactor;
  const scoreMarginSd = getScoreMarginSd(adjustedEloDiff);
  const paceAdjustedSd = getPaceAdjustedSd(scoreMarginSd, totalPointsForecast);
  const tScore = expectedMargin / paceAdjustedSd;

  return studentTCdf(tScore, MEN_T_DF);
}

export function getMatchupWinProbabilities(matchup: Matchup): {
  teamA: number;
  teamB: number;
} {
  const { teamA, teamB } = matchup;

  if (!teamA || !teamB) {
    return {
      teamA: 0,
      teamB: 0,
    };
  }

  const probabilityA = winProbability(teamA, teamB);

  return {
    teamA: probabilityA,
    teamB: 1 - probabilityA,
  };
}

/**
 * NCAA tournament defaults:
 * - neutral site => no home-court bonus
 * - no travel-distance adjustment yet
 *
 * If you later add per-game site distances, this is where they go.
 */
function getAdjustedEloDifference(teamA: Team, teamB: Team): number {
  return teamA.cooperRating - teamB.cooperRating;
}

function getTotalPointsForecast(teamA: Team, teamB: Team): number {
  const leagueCurrentPpg = getLeagueCurrentPpg(teamA, teamB);

  return (
    (teamA.pppg + teamA.ppag) *
    (teamB.pppg + teamB.ppag) /
    leagueCurrentPpg
  );
}

function getLeagueCurrentPpg(teamA: Team, teamB: Team): number {
  const values = [teamA.leagueCurrentPpg, teamB.leagueCurrentPpg].filter(
    (value): value is number => Number.isFinite(value) && value > 0
  );

  if (values.length === 0) {
    return 148.9;
  }

  return values[0];
}

function getEloToPointsFactor(
  totalPointsForecast: number,
  teamA: Team,
  teamB: Team
): number {
  const leagueCurrentPpg = getLeagueCurrentPpg(teamA, teamB);

  return (
    MEN_ELO_TO_POINTS_BASE +
    (totalPointsForecast - leagueCurrentPpg) * MEN_ELO_TO_POINTS_PACE_FACTOR
  );
}

function getScoreMarginSd(adjustedEloDiff: number): number {
  const logisticPart =
    MEN_SD_LOGISTIC_TOP /
    (1 +
      Math.exp(
        -MEN_SD_LOGISTIC_SLOPE *
          (Math.abs(adjustedEloDiff) - MEN_SD_LOGISTIC_CENTER)
      ));

  return (MEN_SD_LOGISTIC_BASE + logisticPart) * Math.sqrt(Math.PI / 2);
}

function getPaceAdjustedSd(
  scoreMarginSd: number,
  totalPointsForecast: number
): number {
  return (
    scoreMarginSd * (1 - MEN_SD_PACE_WEIGHT) +
    scoreMarginSd *
      (totalPointsForecast / MEN_SD_PACE_BASELINE) *
      MEN_SD_PACE_WEIGHT
  );
}

export function getMatchupWinner(matchup: Matchup): Team {
  const { teamA, teamB } = matchup;

  if (!teamA || !teamB) {
    throw new Error(`Matchup ${matchup.id} is missing a team.`);
  }

  const probabilityA = winProbability(teamA, teamB);

  if (Math.random() < probabilityA) {
    return teamA;
  }

  return teamB;
}

export type TournamentRound = {
  name: string;
  matchups: Matchup[];
};

function getRoundName(matchupCount: number): string {
  switch (matchupCount) {
    case 32:
      return 'Round of 64';
    case 16:
      return 'Round of 32';
    case 8:
      return 'Sweet 16';
    case 4:
      return 'Elite 8';
    case 2:
      return 'Final Four';
    case 1:
      return 'Championship';
    default:
      return `Round with ${matchupCount} matchups`;
  }
}

function getRoundKey(matchupCount: number): string {
  switch (matchupCount) {
    case 32:
      return 'round-of-64';
    case 16:
      return 'round-of-32';
    case 8:
      return 'sweet-16';
    case 4:
      return 'elite-8';
    case 2:
      return 'final-four';
    case 1:
      return 'championship';
    default:
      return `round-${matchupCount}`;
  }
}

export function generateNextRoundMatchups(
  completedMatchups: Matchup[],
  nextRoundKey: string
): Matchup[] {
  const matchups: Matchup[] = [];

  for (let i = 0; i < completedMatchups.length; i += 2) {
    const topMatchup = completedMatchups[i];
    const bottomMatchup = completedMatchups[i + 1];

    if (!topMatchup?.winner || !bottomMatchup?.winner) {
      continue;
    }

    matchups.push({
      id: `${nextRoundKey}-matchup-${i / 2 + 1}`,
      teamA: topMatchup.winner,
      teamB: bottomMatchup.winner,
    });
  }

  return matchups;
}

export function simulateTournament(initialMatchups: Matchup[]): TournamentRound[] {
  const rounds: TournamentRound[] = [];
  let currentMatchups = initialMatchups.map((matchup) => ({ ...matchup }));

  while (currentMatchups.length > 0) {
    const completedMatchups = currentMatchups.map((matchup) => ({
      ...matchup,
      winner: getMatchupWinner(matchup),
    }));

    rounds.push({
      name: getRoundName(completedMatchups.length),
      matchups: completedMatchups,
    });

    if (completedMatchups.length === 1) {
      break;
    }

    const nextRoundMatchupCount = completedMatchups.length / 2;
    const nextRoundKey = getRoundKey(nextRoundMatchupCount);
    currentMatchups = generateNextRoundMatchups(completedMatchups, nextRoundKey);
  }

  return rounds;
}

export function generateRoundOneMatchups(teams: Team[]): Matchup[] {
  const regions = ['East', 'South', 'West', 'Midwest'];
  const allMatchups: Matchup[] = [];
  let matchupNumber = 1;

  regions.forEach((region) => {
    const regionTeams = teams.filter((team) => team.region === region);
    const regionMatchups = generateRegionRoundOneMatchups(regionTeams);

    regionMatchups.forEach((matchup) => {
      allMatchups.push({
        ...matchup,
        id: `round-of-64-matchup-${matchupNumber}`,
      });
      matchupNumber += 1;
    });
  });

  return allMatchups;
}

function generateRegionRoundOneMatchups(teams: Team[]): Matchup[] {
  const teamsBySeed = new Map<number, Team>();

  teams.forEach((team) => {
    teamsBySeed.set(team.seed, team);
  });

  const seedPairs: Array<[number, number]> = [
    [1, 16],
    [8, 9],
    [5, 12],
    [4, 13],
    [6, 11],
    [3, 14],
    [7, 10],
    [2, 15],
  ];

  return seedPairs
    .map(([seedA, seedB]) => {
      const teamA = teamsBySeed.get(seedA);
      const teamB = teamsBySeed.get(seedB);

      if (!teamA || !teamB) {
        return null;
      }

      return {
        id: '',
        teamA,
        teamB,
      } satisfies Matchup;
    })
    .filter((matchup): matchup is Matchup => matchup !== null);
}

/**
 * Student's t CDF using the regularized incomplete beta function.
 * Good enough for simulation use and avoids adding another dependency.
 */
function studentTCdf(t: number, df: number): number {
  if (!Number.isFinite(t)) {
    return t < 0 ? 0 : 1;
  }

  if (df <= 0) {
    throw new Error('Degrees of freedom must be positive.');
  }

  if (t === 0) {
    return 0.5;
  }

  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  const ib = regularizedIncompleteBeta(x, a, b);

  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) {
    return 0;
  }

  if (x >= 1) {
    return 1;
  }

  const lnBeta =
    logGamma(a) + logGamma(b) - logGamma(a + b);

  const front = Math.exp(
    a * Math.log(x) +
      b * Math.log(1 - x) -
      lnBeta
  );

  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(x, a, b)) / a;
  }

  return 1 - (front * betaContinuedFraction(1 - x, b, a)) / b;
}

function betaContinuedFraction(
  x: number,
  a: number,
  b: number
): number {
  const maxIterations = 200;
  const epsilon = 3e-14;
  const fpMin = 1e-300;

  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;

  if (Math.abs(d) < fpMin) {
    d = fpMin;
  }

  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m += 1) {
    const m2 = 2 * m;

    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) {
      d = fpMin;
    }
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) {
      c = fpMin;
    }
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) {
      d = fpMin;
    }
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) {
      c = fpMin;
    }
    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < epsilon) {
      break;
    }
  }

  return h;
}

function logGamma(z: number): number {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return (
      Math.log(Math.PI) -
      Math.log(Math.sin(Math.PI * z)) -
      logGamma(1 - z)
    );
  }

  let x = 0.9999999999998099;
  const g = 7;
  let n = z - 1;

  for (let i = 0; i < coefficients.length; i += 1) {
    x += coefficients[i] / (n + i + 1);
  }

  const t = n + g + 0.5;

  return (
    0.5 * Math.log(2 * Math.PI) +
    (n + 0.5) * Math.log(t) -
    t +
    Math.log(x)
  );
}