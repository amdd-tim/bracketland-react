import type { Matchup, Team } from '../lib/types';

type MatchupCardProps = {
  matchup: Matchup;
  winner: Team;
};

function MatchupCard({ matchup, winner }: MatchupCardProps) {
  return (
    <section>
      <h2>Matchup</h2>
      <p>
        {matchup.teamA.name} vs {matchup.teamB.name}
      </p>
      <p>
        Winner: <strong>{winner.name}</strong>
      </p>
    </section>
  );
}

export default MatchupCard;