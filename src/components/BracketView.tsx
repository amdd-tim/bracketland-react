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

              <div
                style={{
                  display: 'grid',
                  gap: getRoundGap(round.matchups.length),
                }}
              >
                {round.matchups.map((matchup, index) => (
                  <GameBox
                    key={matchup.id}
                    topTeam={matchup.teamA}
                    bottomTeam={matchup.teamB}
                    winnerId={round.winners[index]?.id}
                  />
                ))}
              </div>
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
  return (
    <div
      style={{
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      {regions.map((region) => (
        <RegionBracket
          key={region}
          region={region}
          teams={teams}
          tournamentRounds={tournamentRounds}
        />
      ))}
    </div>
  );
}

type RegionBracketProps = {
  region: string;
  teams: Team[];
  tournamentRounds: TournamentRound[];
};

function RegionBracket({ region, teams, tournamentRounds }: RegionBracketProps) {
  const roundOf64 = tournamentRounds.find((round) => round.name === 'Round of 64');
  const roundOf32 = tournamentRounds.find((round) => round.name === 'Round of 32');
  const sweet16 = tournamentRounds.find((round) => round.name === 'Sweet 16');
  const elite8 = tournamentRounds.find((round) => round.name === 'Elite 8');

  const regionTeams = teams.filter((team) => team.region === region);
  const firstRoundGames = buildRegionFirstRound(regionTeams);

  const regionRound64Matchups = filterRoundMatchupsByRegion(roundOf64, region);
  const regionRound32Matchups = filterRoundMatchupsByRegion(roundOf32, region);
  const regionSweet16Matchups = filterRoundMatchupsByRegion(sweet16, region);
  const regionElite8Matchups = filterRoundMatchupsByRegion(elite8, region);

  return (
    <section
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
          gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
          overflowX: 'auto',
        }}
      >
        <RoundColumn
          title="Round of 64"
          gap="0.75rem"
          games={firstRoundGames.map((game, index) => {
            const actualMatchup = regionRound64Matchups[index];

            return (
              <GameBox
                key={`${region}-r64-${index}`}
                topTeam={game[0]}
                bottomTeam={game[1]}
                winnerId={actualMatchup ? getWinnerId(actualMatchup, roundOf64) : undefined}
              />
            );
          })}
        />

        <RoundColumn
          title="Round of 32"
          gap="1.5rem"
          offset="2rem"
          games={regionRound32Matchups.map((matchup) => (
            <GameBox
              key={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup, roundOf32)}
            />
          ))}
        />

        <RoundColumn
          title="Sweet 16"
          gap="3rem"
          offset="4rem"
          games={regionSweet16Matchups.map((matchup) => (
            <GameBox
              key={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup, sweet16)}
            />
          ))}
        />

        <RoundColumn
          title="Elite 8"
          gap="6rem"
          offset="7rem"
          games={regionElite8Matchups.map((matchup) => (
            <GameBox
              key={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup, elite8)}
            />
          ))}
        />
      </div>
    </section>
  );
}

type RoundColumnProps = {
  title: string;
  games: React.ReactNode[];
  gap: string;
  offset?: string;
};

function RoundColumn({ title, games, gap, offset = '0' }: RoundColumnProps) {
  return (
    <div>
      <h4 style={{ marginBottom: '0.75rem' }}>{title}</h4>

      <div
        style={{
          display: 'grid',
          gap,
          marginTop: offset,
        }}
      >
        {games}
      </div>
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

function filterRoundMatchupsByRegion(
  round: TournamentRound | undefined,
  region: string
): Matchup[] {
  if (!round) {
    return [];
  }

  return round.matchups.filter(
    (matchup) =>
      matchup.teamA.region === region && matchup.teamB.region === region
  );
}

function getWinnerId(
  matchup: Matchup,
  round: TournamentRound | undefined
): string | undefined {
  if (!round) {
    return undefined;
  }

  const matchupIndex = round.matchups.findIndex(
    (roundMatchup) => roundMatchup.id === matchup.id
  );

  if (matchupIndex === -1) {
    return undefined;
  }

  return round.winners[matchupIndex]?.id;
}

function getRoundGap(matchupCount: number): string {
  switch (matchupCount) {
    case 4:
      return '3rem';
    case 2:
      return '5rem';
    case 1:
      return '7rem';
    default:
      return '1rem';
  }
}

export default BracketView;