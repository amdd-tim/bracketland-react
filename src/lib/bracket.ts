import type { Matchup, Team } from './types';
import type { TournamentRound } from './simulation';

function cloneRounds(rounds: TournamentRound[]): TournamentRound[] {
  return rounds.map((round) => ({
    ...round,
    matchups: round.matchups.map((matchup) => ({
      ...matchup,
    })),
  }));
}

function replaceTeamInMatchup(
  matchup: Matchup,
  oldTeamId: string,
  newTeam: Team
): Matchup {
  const nextMatchup = { ...matchup };

  if (nextMatchup.teamA?.id === oldTeamId) {
    nextMatchup.teamA = newTeam;
  }

  if (nextMatchup.teamB?.id === oldTeamId) {
    nextMatchup.teamB = newTeam;
  }

  if (nextMatchup.winner?.id === oldTeamId) {
    nextMatchup.winner = newTeam;
  }

  return nextMatchup;
}

export function updateBracketWinner(
  rounds: TournamentRound[],
  roundName: string,
  matchupId: string,
  newWinnerId: string
): TournamentRound[] {
  const nextRounds = cloneRounds(rounds);

  const roundIndex = nextRounds.findIndex((round) => round.name === roundName);
  if (roundIndex === -1) {
    return rounds;
  }

  const matchupIndex = nextRounds[roundIndex].matchups.findIndex(
    (matchup) => matchup.id === matchupId
  );
  if (matchupIndex === -1) {
    return rounds;
  }

  const matchup = nextRounds[roundIndex].matchups[matchupIndex];
  const { teamA, teamB, winner } = matchup;

  if (!teamA || !teamB || !winner) {
    return rounds;
  }

  const newWinner =
    teamA.id === newWinnerId ? teamA : teamB.id === newWinnerId ? teamB : null;

  if (!newWinner || newWinner.id === winner.id) {
    return rounds;
  }

  const oldWinner = winner;

  nextRounds[roundIndex].matchups[matchupIndex] = {
    ...matchup,
    winner: newWinner,
  };

  let currentOldWinnerId = oldWinner.id;
  let currentNewWinner = newWinner;
  let currentRoundIndex = roundIndex;
  let currentMatchupIndex = matchupIndex;

  while (currentRoundIndex < nextRounds.length - 1) {
    const downstreamRoundIndex = currentRoundIndex + 1;
    const downstreamMatchupIndex = Math.floor(currentMatchupIndex / 2);
    const downstreamRound = nextRounds[downstreamRoundIndex];
    const downstreamMatchup = downstreamRound.matchups[downstreamMatchupIndex];

    if (!downstreamMatchup) {
      break;
    }

    const containsOldWinner =
      downstreamMatchup.teamA?.id === currentOldWinnerId ||
      downstreamMatchup.teamB?.id === currentOldWinnerId;

    if (!containsOldWinner) {
      break;
    }

    const updatedDownstreamMatchup = replaceTeamInMatchup(
      downstreamMatchup,
      currentOldWinnerId,
      currentNewWinner
    );

    downstreamRound.matchups[downstreamMatchupIndex] = updatedDownstreamMatchup;

    currentRoundIndex = downstreamRoundIndex;
    currentMatchupIndex = downstreamMatchupIndex;
    currentOldWinnerId = currentOldWinnerId;
    currentNewWinner = currentNewWinner;
  }

  return nextRounds;
}