import { useEffect, useState } from 'react';
import type { Team } from './lib/types';
import type { TournamentRound } from './lib/simulation';
import {
  mergeTeams,
  parseCsv,
  rowsToCooperNameMap,
  rowsToAdjustedCompositeRatings,
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
      const [tournamentResponse, ratingsResponse, mapResponse] = await Promise.all([
        fetch('/data/tournament-teams.csv'),
        fetch('/data/cooper-ratings-comp.csv'),
        fetch('/data/cooper-name-map.csv'),
      ]);

      const [tournamentText, ratingsText, mapText] = await Promise.all([
        tournamentResponse.text(),
        ratingsResponse.text(),
        mapResponse.text(),
      ]);

      const tournamentRows = rowsToTournamentTeams(parseCsv(tournamentText));
      const ratingsRows = rowsToAdjustedCompositeRatings(parseCsv(ratingsText));
      const mapRows = rowsToCooperNameMap(parseCsv(mapText));

      const loadedTeams = mergeTeams(tournamentRows, ratingsRows, mapRows);
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
      
      <div className="app-header">
        <h1>Bracketland</h1>
        <div className="app-controls">
          <button onClick={generateBracket}>Generate Bracket</button>
          <button onClick={printBracket}>Print Bracket</button>
        </div>
      </div>

      <BracketView
        tournamentRounds={tournamentRounds}
        teams={teams}
        onPickWinner={handlePickWinner}
      />
    </main>
  );
}

export default App;