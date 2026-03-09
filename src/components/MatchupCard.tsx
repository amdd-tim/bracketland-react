import type { Matchup, Team } from '../lib/types';

type MatchupCardProps = {
  matchup: Matchup;
  winner: Team;
};

function MatchupCard({ matchup, winner }: MatchupCardProps) {
  return (
    <section
      style={{
        padding: '1rem',
        marginBottom: '1rem',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '0.75rem',
      }}
    >
      <h3>Matchup</h3>
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