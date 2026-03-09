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