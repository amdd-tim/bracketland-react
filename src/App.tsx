import { useEffect, useState } from 'react';
import type { Team } from './lib/types';
import type { TournamentRound } from './lib/simulation';
import { parseCsv, rowsToTeams } from './lib/csv';
import { generateRoundOneMatchups, simulateTournament } from './lib/simulation';
import BracketView from './components/BracketView';
import TeamCard from './components/TeamCard';

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentRounds, setTournamentRounds] = useState<TournamentRound[]>([]);
  const [showTeams, setShowTeams] = useState(false);

  useEffect(() => {
    async function loadData() {
      const response = await fetch('/data/mm-data-2024.csv');
      const text = await response.text();

      const rows = parseCsv(text);
      const loadedTeams = rowsToTeams(rows);
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

      <BracketView tournamentRounds={tournamentRounds} teams={teams} />

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