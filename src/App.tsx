import { useEffect, useState } from 'react';
import type { Team } from './lib/types';
import type { TournamentRound } from './lib/simulation';
import {
  mergeTeams,
  parseCsv,
  rowsToCooperNameMap,
  rowsToCooperRatings,
  rowsToTournamentTeams,
} from './lib/csv';
import { generateRoundOneMatchups, simulateTournament } from './lib/simulation';
import { updateBracketWinner } from './lib/bracket';
import BracketView from './components/BracketView';
import TeamCard from './components/TeamCard';

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentRounds, setTournamentRounds] = useState<TournamentRound[]>([]);
  const [showTeams, setShowTeams] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [tournamentResponse, cooperResponse, mapResponse] = await Promise.all([
        fetch('/data/tournament-teams.csv'),
        fetch('/data/cooper-ratings.csv'),
        fetch('/data/cooper-name-map.csv'),
      ]);

      const [tournamentText, cooperText, mapText] = await Promise.all([
        tournamentResponse.text(),
        cooperResponse.text(),
        mapResponse.text(),
      ]);

      const tournamentRows = rowsToTournamentTeams(parseCsv(tournamentText));
      const cooperRows = rowsToCooperRatings(parseCsv(cooperText));
      const mapRows = rowsToCooperNameMap(parseCsv(mapText));

      const loadedTeams = mergeTeams(tournamentRows, cooperRows, mapRows);
      const matchups = generateRoundOneMatchups(loadedTeams);
      const tournament = simulateTournament(matchups);

      setTeams(loadedTeams);
      setTournamentRounds(tournament);
    }

    loadData();
  }, []);

  function generateBracket() {
    const matchups = generateRoundOneMatchups(teams);
    const tournament = simulateTournament(matchups);
    setTournamentRounds(tournament);
  }

  function printBracket() {
    window.print();
  }

  function handlePickWinner(
    roundName: string,
    matchupId: string,
    teamId: string
  ) {
    setTournamentRounds((currentRounds) =>
      updateBracketWinner(currentRounds, roundName, matchupId, teamId)
    );
  }

  return (
    <main>
      <h1>Bracketland</h1>

      <div className="app-controls">
        <button onClick={generateBracket}>Generate Bracket</button>
        <button onClick={printBracket}>Print Bracket</button>
        <button onClick={() => setShowTeams(!showTeams)}>
          {showTeams ? 'Hide Teams' : 'Show Teams'}
        </button>
      </div>

      <BracketView
        tournamentRounds={tournamentRounds}
        teams={teams}
        onPickWinner={handlePickWinner}
      />

      {showTeams && (
        <>
          <h2>All Teams</h2>
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </>
      )}
    </main>
  );
}

export default App;