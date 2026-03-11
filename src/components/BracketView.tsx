import type { Matchup, Team } from '../lib/types';
import type { TournamentRound } from '../lib/simulation';
import styles from './BracketView.module.css';

type BracketViewProps = {
  tournamentRounds: TournamentRound[];
  teams: Team[];
};

function BracketView({ tournamentRounds, teams }: BracketViewProps) {
  const finalFour = tournamentRounds.find((round) => round.name === 'Final Four');
  const championship = tournamentRounds.find(
    (round) => round.name === 'Championship'
  );
  const champion =
    tournamentRounds.length > 0
      ? tournamentRounds[tournamentRounds.length - 1].winners[0]
      : null;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Tournament Bracket</h2>

      <div className={styles.bracketGrid}>
        <div className={styles.regionCell}>
          <RegionBracket
            region="East"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="left"
          />
        </div>

        <div className={styles.regionCell}>
          <RegionBracket
            region="South"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="right"
          />
        </div>

        <div className={styles.finalsRow}>
          <h3 className={styles.sectionTitle}>Final Four</h3>

          <div className={styles.finalsInner}>
            {(finalFour?.matchups ?? []).map((matchup) => (
              <div key={matchup.id} className={styles.finalFourGame}>
                <GameBox
                  topTeam={matchup.teamA}
                  bottomTeam={matchup.teamB}
                  winnerId={getWinnerId(matchup, finalFour)}
                />
              </div>
            ))}
          </div>

          {(championship?.matchups ?? []).length ? (
            <>
              <h4 className={styles.roundHeading}>Championship</h4>
              <div className={styles.championshipWrap}>
                {championship?.matchups.map((matchup) => (
                  <div key={matchup.id} className={styles.championshipGame}>
                    <GameBox
                      topTeam={matchup.teamA}
                      bottomTeam={matchup.teamB}
                      winnerId={getWinnerId(matchup, championship)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {champion && (
            <div className={styles.championBlock}>
              <h4 className={styles.roundHeading}>Champion</h4>
              <div className={styles.gameBox}>
                <div className={`${styles.teamLine} ${styles.teamLineWinner}`}>
                  <span>{champion.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.regionCell}>
          <RegionBracket
            region="West"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="left"
          />
        </div>

        <div className={styles.regionCell}>
          <RegionBracket
            region="Midwest"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="right"
          />
        </div>
      </div>
    </div>
  );
}

type RegionBracketProps = {
  region: string;
  teams: Team[];
  tournamentRounds: TournamentRound[];
  side: 'left' | 'right';
};

function RegionBracket({
  region,
  teams,
  tournamentRounds,
  side,
}: RegionBracketProps) {
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
    <section className={styles.regionBracket}>
      <h3 className={styles.regionTitle}>{region}</h3>

      <div
        className={`${styles.regionRounds} ${
          side === 'left' ? styles.regionRoundsLeft : styles.regionRoundsRight
        }`}
      >
        <RoundColumn
          title="Round of 64"
          gap="0.75rem"
          side={side}
          showConnectors
          games={firstRoundGames.map((game, index) => {
            const actualMatchup = regionRound64Matchups[index];

            return (
              <GameBox
                key={`${region}-r64-${index}`}
                topTeam={game[0]}
                bottomTeam={game[1]}
                winnerId={
                  actualMatchup ? getWinnerId(actualMatchup, roundOf64) : undefined
                }
              />
            );
          })}
        />

        <RoundColumn
          title="Round of 32"
          gap="1.5rem"
          offset="2rem"
          side={side}
          showConnectors
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
          side={side}
          showConnectors
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
          side={side}
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
  side: 'left' | 'right';
  showConnectors?: boolean;
};

function RoundColumn({
  title,
  games,
  gap,
  offset = '0',
  side,
  showConnectors = false,
}: RoundColumnProps) {
  return (
    <div className={styles.roundColumn}>
      <h4 className={styles.roundColumnTitle}>{title}</h4>

      <div
        className={styles.roundGames}
        style={{
          gap,
          marginTop: offset,
          ['--round-gap' as string]: gap,
        }}
      >
        {games.map((game, index) => {
          const isTopOfPair = index % 2 === 0;
          const wrapperClass = isTopOfPair
            ? styles.gameWrapperTop
            : styles.gameWrapperBottom;

          return (
            <div key={index} className={wrapperClass}>
              {game}

              {showConnectors && (
                <div
                  className={
                    side === 'left' ? styles.connectorLeft : styles.connectorRight
                  }
                />
              )}

              {showConnectors && isTopOfPair && index < games.length - 1 && (
                <div
                  className={side === 'left' ? styles.spineLeft : styles.spineRight}
                />
              )}
            </div>
          );
        })}
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
    <div className={styles.gameBox}>
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
      <div className={styles.teamLineEmpty}>
        <span>—</span>
      </div>
    );
  }

  const logoUrl = `https://secure.espn.com/combiner/i?img=/i/teamlogos/ncaa/500/${team.id}.png&w=40&h=40`;

  return (
    <div className={`${styles.teamLine} ${isWinner ? styles.teamLineWinner : ''}`}>
      <img
        className={styles.teamLogo}
        src={logoUrl}
        alt={team.name}
        width="20"
        height="20"
      />

      <span className={styles.teamName}>
        <sup className={styles.seed}>{team.seed}</sup>
        {team.name}
      </span>
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

export default BracketView;