import type { Team } from '../lib/types';
import type { TournamentRound } from '../lib/simulation';

type BracketViewProps = {
  tournamentRounds: TournamentRound[];
  teams: Team[];
};

function BracketView({ tournamentRounds, teams }: BracketViewProps) {
  const regions = ['East', 'West', 'South', 'Midwest'];

  return (
    <section>
      <h2>Tournament Bracket</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {regions.map((region) => {
          const regionTeams = teams.filter((team) => team.region === region);

          return (
            <section
              key={region}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}
            >
              <h3>{region}</h3>

              <p>
                Teams: <strong>{regionTeams.length}</strong>
              </p>

              {regionTeams.map((team) => (
                <div
                  key={team.id}
                  style={{
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <strong>{team.seed}</strong> {team.name}
                </div>
              ))}
            </section>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Champion</h3>
        <p>
          {tournamentRounds.length > 0
            ? tournamentRounds[tournamentRounds.length - 1].winners[0].name
            : 'No champion yet'}
        </p>
      </div>
    </section>
  );
}

export default BracketView;