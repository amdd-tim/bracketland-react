import type { ReactNode } from 'react';
import type { Matchup, Team } from '../lib/types';
import type { TournamentRound } from '../lib/simulation';
import styles from './BracketView.module.css';

type BracketViewProps = {
  tournamentRounds: TournamentRound[];
  teams: Team[];
  onPickWinner: (roundName: string, matchupId: string, teamId: string) => void;
};

function BracketView({
  tournamentRounds,
  teams,
  onPickWinner,
}: BracketViewProps) {
  const finalFour = tournamentRounds.find((round) => round.name === 'Final Four');
  const championship = tournamentRounds.find(
    (round) => round.name === 'Championship'
  );
  const championshipMatchup =
    championship?.matchups.length ? championship.matchups[0] : undefined;
  const champion = championshipMatchup?.winner ?? null;

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
            onPickWinner={onPickWinner}
          />
        </div>

        <div className={styles.regionCell}>
          <RegionBracket
            region="West"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="right"
            onPickWinner={onPickWinner}
          />
        </div>

        <div className={styles.centerPanel}>
          <div className={styles.finalsRow}>
            <div className={styles.finalsColumn}>
              <h4 className={styles.roundHeading}>Final Four</h4>
              {(finalFour?.matchups ?? []).slice(0, 1).map((matchup) => (
                <div key={matchup.id} className={styles.finalsGame}>
                  <GameBox
                    roundName={finalFour?.name ?? ''}
                    matchupId={matchup.id}
                    topTeam={matchup.teamA}
                    bottomTeam={matchup.teamB}
                    winnerId={getWinnerId(matchup)}
                    onPickWinner={onPickWinner}
                  />
                </div>
              ))}
            </div>

            <div className={styles.finalsColumn}>
              <h4 className={styles.roundHeading}>Championship</h4>
              {(championship?.matchups ?? []).map((matchup) => (
                <div key={matchup.id} className={styles.championshipGame}>
                  <GameBox
                    roundName={championship?.name ?? ''}
                    matchupId={matchup.id}
                    topTeam={matchup.teamA}
                    bottomTeam={matchup.teamB}
                    winnerId={getWinnerId(matchup)}
                    onPickWinner={onPickWinner}
                  />
                </div>
              ))}

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

            <div className={styles.finalsColumn}>
              <h4 className={styles.roundHeading}>Final Four</h4>
              {(finalFour?.matchups ?? []).slice(1, 2).map((matchup) => (
                <div key={matchup.id} className={styles.finalsGame}>
                  <GameBox
                    roundName={finalFour?.name ?? ''}
                    matchupId={matchup.id}
                    topTeam={matchup.teamA}
                    bottomTeam={matchup.teamB}
                    winnerId={getWinnerId(matchup)}
                    onPickWinner={onPickWinner}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.regionCell}>
          <RegionBracket
            region="South"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="left"
            onPickWinner={onPickWinner}
          />
        </div>

        <div className={styles.regionCell}>
          <RegionBracket
            region="Midwest"
            teams={teams}
            tournamentRounds={tournamentRounds}
            side="right"
            onPickWinner={onPickWinner}
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
  onPickWinner: (roundName: string, matchupId: string, teamId: string) => void;
};

function RegionBracket({
  region,
  teams,
  tournamentRounds,
  side,
  onPickWinner,
}: RegionBracketProps) {
  const roundOf64 = tournamentRounds.find((round) => round.name === 'Round of 64');
  const roundOf32 = tournamentRounds.find((round) => round.name === 'Round of 32');
  const sweet16 = tournamentRounds.find((round) => round.name === 'Sweet 16');
  const elite8 = tournamentRounds.find((round) => round.name === 'Elite 8');

  const regionTeams = teams.filter((team) => team.region === region);

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
          games={regionRound64Matchups.map((matchup) => (
            <GameBox
              roundName={roundOf64?.name ?? ''}
              matchupId={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup)}
              onPickWinner={onPickWinner}
            />
          ))}
        />

        <RoundColumn
          title="Round of 32"
          gap="1.5rem"
          offset="2rem"
          side={side}
          showConnectors
          games={regionRound32Matchups.map((matchup) => (
            <GameBox
              roundName={roundOf32?.name ?? ''}
              matchupId={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup)}
              onPickWinner={onPickWinner}
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
              roundName={sweet16?.name ?? ''}
              matchupId={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup)}
              onPickWinner={onPickWinner}
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
              roundName={elite8?.name ?? ''}
              matchupId={matchup.id}
              topTeam={matchup.teamA}
              bottomTeam={matchup.teamB}
              winnerId={getWinnerId(matchup)}
              onPickWinner={onPickWinner}
            />
          ))}
        />
      </div>
    </section>
  );
}

type RoundColumnProps = {
  title: string;
  games: ReactNode[];
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
  roundName: string;
  matchupId: string;
  topTeam?: Team;
  bottomTeam?: Team;
  winnerId?: string;
  onPickWinner: (roundName: string, matchupId: string, teamId: string) => void;
};

function GameBox({
  roundName,
  matchupId,
  topTeam,
  bottomTeam,
  winnerId,
  onPickWinner,
}: GameBoxProps) {
  return (
    <div className={styles.gameBox}>
      <TeamLine
        team={topTeam}
        isWinner={winnerId === topTeam?.id}
        onClick={
          topTeam ? () => onPickWinner(roundName, matchupId, topTeam.id) : undefined
        }
      />
      <TeamLine
        team={bottomTeam}
        isWinner={winnerId === bottomTeam?.id}
        onClick={
          bottomTeam
            ? () => onPickWinner(roundName, matchupId, bottomTeam.id)
            : undefined
        }
      />
    </div>
  );
}

type TeamLineProps = {
  team?: Team;
  isWinner?: boolean;
  onClick?: () => void;
};

function TeamLine({ team, isWinner = false, onClick }: TeamLineProps) {
  if (!team) {
    return (
      <div className={styles.teamLineEmpty}>
        <span>—</span>
      </div>
    );
  }

  const logoUrl = `https://secure.espn.com/combiner/i?img=/i/teamlogos/ncaa/500/${team.id}.png&w=40&h=40`;

  return (
    <button
      type="button"
      className={`${styles.teamLine} ${isWinner ? styles.teamLineWinner : ''}`}
      onClick={onClick}
    >
      <img src={logoUrl} alt="" className={styles.teamLogo} />
      <span className={styles.teamName}>
        <span>{team.name}</span>
        <sup className={styles.seed}>{team.seed}</sup>
      </span>
    </button>
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
      matchup.teamA?.region === region && matchup.teamB?.region === region
  );
}

function getWinnerId(matchup: Matchup): string | undefined {
  return matchup.winner?.id;
}

export default BracketView;