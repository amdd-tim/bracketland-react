import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Team } from './lib/types';
import type { TournamentRound } from './lib/simulation';
import { teams, roundOneMatchups } from './lib/data';
import { parseCsv, rowsToTeams } from './lib/csv';
import {
  generateRoundOneMatchups,
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

  const [tournamentRounds, setTournamentRounds] = useState<TournamentRound[]>(() =>
    simulateTournament(roundOneMatchups)
  );

  function generateBracket() {
    setTournamentRounds(simulateTournament(activeRoundOneMatchups));
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName('');
      setCsvText('');
      setTournamentRounds(simulateTournament(roundOneMatchups));
      return;
    }

    setSelectedFileName(file.name);

    const text = await file.text();
    setCsvText(text);

    const nextRows = parseCsv(text);
    const nextUploadedTeams = rowsToTeams(nextRows);

    if (nextUploadedTeams.length > 1) {
      const nextMatchups = generateRoundOneMatchups(nextUploadedTeams);
      setTournamentRounds(simulateTournament(nextMatchups));
      return;
    }

    setTournamentRounds(simulateTournament(roundOneMatchups));
  }

  const champion =
    tournamentRounds.length > 0
      ? tournamentRounds[tournamentRounds.length - 1].winners[0]
      : null;

  return (
    <main>
      <h1>Bracketland</h1>
      <p>React learning project is running.</p>

      <section>
        <h2>Upload Rankings CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        {selectedFileName && <p>Selected file: {selectedFileName}</p>}
      </section>

      <button onClick={generateBracket}>Generate Bracket</button>

      {champion && (
        <p>
          Champion: <strong>{champion.name}</strong>
        </p>
      )}

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

          {teamsToDisplay.map((team: Team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </>
      )}
    </main>
  );
}

export default App;