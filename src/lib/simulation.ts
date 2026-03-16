import type { Matchup, Team } from './types';

function winProbability(teamA: Team, teamB: Team): number {
  const ratingDiff = teamA.cooperRating - teamB.cooperRating;
  const exponent = -((ratingDiff * 30.464) / 400);

  return 1 / (1 + Math.pow(10, exponent));
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
  const regions = ['East', 'West', 'South', 'Midwest'];
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