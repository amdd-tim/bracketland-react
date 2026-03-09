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
          const firstRoundGames = buildRegionFirstRound(regionTeams);

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

              <div
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                }}
              >
                {firstRoundGames.map((game, index) => (
                  <div
                    key={`${region}-game-${index}`}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                    }}
                  >
                    <TeamRow team={game[0]} />
                    <TeamRow team={game[1]} />
                  </div>
                ))}
              </div>
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

type TeamRowProps = {
  team?: Team;
};

function TeamRow({ team }: TeamRowProps) {
  if (!team) {
    return (
      <div
        style={{
          padding: '0.6rem 0.75rem',
          borderBottom: '1px solid #eee',
        }}
      >
        —
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.6rem 0.75rem',
        borderBottom: '1px solid #eee',
      }}
    >
      <strong style={{ minWidth: '1.5rem' }}>{team.seed}</strong>
      <span>{team.name}</span>
    </div>
  );
}

function buildRegionFirstRound(
  teams: Team[]
): Array<[Team | undefined, Team | undefined]> {
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

  return seedPairs.map(([seedA, seedB]) => [
    teamsBySeed.get(seedA),
    teamsBySeed.get(seedB),
  ]);
}

export default BracketView;