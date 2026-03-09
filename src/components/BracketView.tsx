import type { Matchup, Team } from '../lib/types';
import type { TournamentRound } from '../lib/simulation';

type BracketViewProps = {
  tournamentRounds: TournamentRound[];
  teams: Team[];
};

function BracketView({ tournamentRounds, teams }: BracketViewProps) {
  const leftRegions = ['East', 'West'];
  const rightRegions = ['South', 'Midwest'];

  const champion =
    tournamentRounds.length > 0
      ? tournamentRounds[tournamentRounds.length - 1].winners[0]
      : null;

  return (
    <section>
      <h2>Tournament Bracket</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px 1fr',
          gap: '1.5rem',
          alignItems: 'start',
          overflowX: 'auto',
        }}
      >
        <RegionSide
          regions={leftRegions}
          teams={teams}
          tournamentRounds={tournamentRounds}
        />

        <section
          style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '1rem',
            padding: '1rem',
            alignSelf: 'stretch',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Final Rounds</h3>

          {tournamentRounds.slice(-3).map((round) => (
            <section key={round.name} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>{round.name}</h4>
              <p>
                {round.matchups.length} matchup
                {round.matchups.length !== 1 ? 's' : ''}
              </p>
            </section>
          ))}

          {champion && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #eee',
              }}
            >
              <h4>Champion</h4>
              <p>
                <strong>{champion.name}</strong>
              </p>
            </div>
          )}
        </section>

        <RegionSide
          regions={rightRegions}
          teams={teams}
          tournamentRounds={tournamentRounds}
        />
      </div>
    </section>
  );
}

type RegionSideProps = {
  regions: string[];
  teams: Team[];
  tournamentRounds: TournamentRound[];
};

function RegionSide({ regions, teams, tournamentRounds }: RegionSideProps) {
  const roundOf64 = tournamentRounds.find((round) => round.name === 'Round of 64');
  const roundOf32 = tournamentRounds.find((round) => round.name === 'Round of 32');

  return (
    <div
      style={{
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      {regions.map((region) => {
        const regionTeams = teams.filter((team) => team.region === region);
        const firstRoundGames = buildRegionFirstRound(regionTeams);

        const roundOf64Matchups = (roundOf64?.matchups ?? []).filter(
          (matchup) =>
            matchup.teamA.region === region && matchup.teamB.region === region
        );

        const roundOf32Teams = (roundOf32?.matchups ?? [])
          .flatMap((matchup) => [matchup.teamA, matchup.teamB])
          .filter((team) => team.region === region);

        const roundOf32Games = pairTeamsInOrder(roundOf32Teams);

        return (
          <section
            key={region}
            style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '1rem',
              padding: '1rem',
            }}
          >
            <h3 style={{ marginBottom: '1rem' }}>{region}</h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              <div>
                <h4 style={{ marginBottom: '0.75rem' }}>Round of 64</h4>
                <div
                  style={{
                    display: 'grid',
                    gap: '0.75rem',
                  }}
                >
                  {firstRoundGames.map((game, index) => {
                    const actualMatchup = roundOf64Matchups[index];

                    return (
                      <GameBox
                        key={`${region}-r64-${index}`}
                        topTeam={game[0]}
                        bottomTeam={game[1]}
                        winnerId={actualMatchup ? getWinnerId(actualMatchup, roundOf64, index) : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.75rem' }}>Round of 32</h4>
                <div
                  style={{
                    display: 'grid',
                    gap: '1.5rem',
                    marginTop: '2.25rem',
                  }}
                >
                  {roundOf32Games.map((game, index) => (
                    <GameBox
                      key={`${region}-r32-${index}`}
                      topTeam={game[0]}
                      bottomTeam={game[1]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

type GameBoxProps = {
  topTeam?: Team;
  bottomTeam?: Team;
  winnerId?: string;
};

function GameBox({ topTeam, bottomTeam, winnerId }: GameBoxProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <TeamLine team={topTeam} isWinner={winnerId === topTeam?.id} />
      <TeamLine team={bottomTeam} isWinner={winnerId === bottomTeam?.id} />
    </div>
  );
}

type TeamLineProps = {
  team?: Team;
  isWinner?: boolean;
};

function TeamLine({ team, isWinner = false }: TeamLineProps) {
  if (!team) {
    return (
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.65rem 0.75rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <span>—</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.65rem 0.75rem',
        borderBottom: '1px solid #eee',
        fontWeight: isWinner ? 700 : 400,
        background: isWinner ? '#f5f5f5' : 'white',
      }}
    >
      <span style={{ minWidth: '1.5rem' }}>{team.seed}</span>
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

function pairTeamsInOrder(teams: Team[]): Array<[Team | undefined, Team | undefined]> {
  const pairs: Array<[Team | undefined, Team | undefined]> = [];

  for (let i = 0; i < teams.length; i += 2) {
    pairs.push([teams[i], teams[i + 1]]);
  }

  return pairs;
}

function getWinnerId(
  matchup: Matchup,
  round: TournamentRound | undefined,
  index: number
): string | undefined {
  if (!round) {
    return undefined;
  }

  return round.winners[index]?.id;
}

export default BracketView;