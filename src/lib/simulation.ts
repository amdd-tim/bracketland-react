import type { Matchup, Team } from './types';

function winProbability(teamA: Team, teamB: Team): number {
  const ratingDiff = teamA.rating - teamB.rating;

  return 1 / (1 + Math.pow(10, -ratingDiff / 400));
}

export function getMatchupWinner(matchup: Matchup): Team {
  const { teamA, teamB } = matchup;
  const probabilityA = winProbability(teamA, teamB);

  if (Math.random() < probabilityA) {
    return teamA;
  }

  return teamB;
}

export function generateNextRoundMatchups(winners: Team[]): Matchup[] {
  const matchups: Matchup[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    const teamA = winners[i];
    const teamB = winners[i + 1];

    if (!teamA || !teamB) {
      continue;
    }

    matchups.push({
      id: `next-${i / 2 + 1}`,
      teamA,
      teamB,
    });
  }

  return matchups;
}

export type SimulatedRound = {
  winners: Team[];
  nextMatchups: Matchup[];
};

export function simulateRound(matchups: Matchup[]): SimulatedRound {
  const winners = matchups.map((matchup) => getMatchupWinner(matchup));
  const nextMatchups = generateNextRoundMatchups(winners);

  return {
    winners,
    nextMatchups,
  };
}

export type TournamentRound = {
  name: string;
  matchups: Matchup[];
  winners: Team[];
};

export function simulateTournament(initialMatchups: Matchup[]): TournamentRound[] {
  const rounds: TournamentRound[] = [];
  let currentMatchups = initialMatchups;

  while (currentMatchups.length > 0) {
    const winners = currentMatchups.map((matchup) => getMatchupWinner(matchup));

    rounds.push({
      name: getRoundName(currentMatchups.length),
      matchups: currentMatchups,
      winners,
    });

    if (winners.length === 1) {
      break;
    }

    currentMatchups = generateNextRoundMatchups(winners);
  }

  return rounds;
}

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
        id: `matchup-${matchupNumber}`,
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