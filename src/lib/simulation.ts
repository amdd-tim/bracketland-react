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

export function generateBracketResults(roundOneMatchups: Matchup[]): Record<string, Team> {
  const winners: Record<string, Team> = {};

  roundOneMatchups.forEach((matchup) => {
    winners[matchup.id] = getMatchupWinner(matchup);
  });

  const championshipMatchup: Matchup = {
    id: 'matchup-3',
    teamA: winners['matchup-1'],
    teamB: winners['matchup-2'],
  };

  winners[championshipMatchup.id] = getMatchupWinner(championshipMatchup);

  return winners;
}

export function generateRoundOneMatchups(teams: Team[]): Matchup[] {
  const matchups: Matchup[] = [];

  for (let i = 0; i < teams.length; i += 2) {
    const teamA = teams[i];
    const teamB = teams[i + 1];

    if (!teamA || !teamB) {
      continue;
    }

    matchups.push({
      id: `matchup-${i / 2 + 1}`,
      teamA,
      teamB,
    });
  }

  return matchups;
}

export function generateNextRoundMatchups(winners: Team[]): Matchup[] {
  const matchups: Matchup[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    const teamA = winners[i];
    const teamB = winners[i + 1];

    if (!teamA || !teamB) continue;

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