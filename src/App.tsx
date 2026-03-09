import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Matchup, Team } from './lib/types';
import { teams, roundOneMatchups } from './lib/data';
import { parseCsv, rowsToTeams } from './lib/csv';
import {
  generateRoundOneMatchups,
  getMatchupWinner,
  simulateTournament,
} from './lib/simulation';
import MatchupCard from './components/MatchupCard';
import TeamCard from './components/TeamCard';

function App() {
  const [showTeams, setShowTeams] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [csvText, setCsvText] = useState('');

  const parsedRows = parseCsv(csvText);
  const uploadedTeams = rowsToTeams(parsedRows);
  const teamsToDisplay = uploadedTeams.length > 0 ? uploadedTeams : teams;

  const activeRoundOneMatchups =
  uploadedTeams.length > 1
    ? generateRoundOneMatchups(uploadedTeams)
    : roundOneMatchups;

  const [winners, setWinners] = useState<Record<string, Team>>(() =>
    generateRoundOneWinners(roundOneMatchups)
  );

  function generateBracket() {
    setWinners(generateRoundOneWinners(activeRoundOneMatchups));
  }

  const tournamentRounds = simulateTournament(activeRoundOneMatchups);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName('');
      setCsvText('');
      setWinners(generateRoundOneWinners(roundOneMatchups));
      return;
    }

    setSelectedFileName(file.name);

    const text = await file.text();
    setCsvText(text);

    const nextRows = parseCsv(text);
    const nextUploadedTeams = rowsToTeams(nextRows);

    if (nextUploadedTeams.length > 1) {
      const nextMatchups = generateRoundOneMatchups(nextUploadedTeams);
      setWinners(generateRoundOneWinners(nextMatchups));
      return;
    }

    setWinners(generateRoundOneWinners(roundOneMatchups));
  }

  return (
    <main>
      <h1>Bracketland</h1>
      <p>React learning project is running.</p>

      <section>
        <h2>Upload Rankings CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        {selectedFileName && <p>Selected file: {selectedFileName}</p>}
        {csvText && <pre>{JSON.stringify(parsedRows, null, 2)}</pre>}
      </section>

      <button onClick={generateBracket}>Generate Bracket</button>

      {tournamentRounds.map((round) => (
        <section key={round.name}>
          <h2>{round.name}</h2>

          {round.matchups.map((matchup, index) => (
            <MatchupCard
              key={matchup.id}
              matchup={matchup}
              winner={round.winners[index]}
            />
          ))}
        </section>
      ))}

      <button onClick={() => setShowTeams(!showTeams)}>
        {showTeams ? 'Hide Teams' : 'Show Teams'}
      </button>

      {showTeams && (
        <>
          <h2>{uploadedTeams.length > 0 ? 'Uploaded Teams' : 'All Teams'}</h2>

          {teamsToDisplay.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </>
      )}
    </main>
  );
}

function generateRoundOneWinners(matchups: Matchup[]): Record<string, Team> {
  const nextWinners: Record<string, Team> = {};

  matchups.forEach((matchup) => {
    nextWinners[matchup.id] = getMatchupWinner(matchup);
  });

  return nextWinners;
}

export default App;