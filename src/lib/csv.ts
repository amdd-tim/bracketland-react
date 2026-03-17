import type { Team } from './types';

export type CsvRow = Record<string, string>;

type TournamentTeamRow = {
  teamKey: string;
  displayName: string;
  seed: number;
  region: string;
  teamLogoId: string;
};

type AdjustedCompositeRatingRow = {
  sbName: string;
  adjustedComposite: number;
};

type CooperNameMapRow = {
  sbName: string;
  teamKey: string;
};

export function parseCsv(text: string): CsvRow[] {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  const lines = trimmedText.split(/\r?\n/);
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line).map((value) => value.trim());
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function rowsToTournamentTeams(rows: CsvRow[]): TournamentTeamRow[] {
  return rows.map((row) => ({
    teamKey: row.team_key,
    displayName: row.display_name,
    seed: toNumber(row.seed),
    region: row.region,
    teamLogoId: row.team_logo_id || '',
  }));
}

export function rowsToAdjustedCompositeRatings(
  rows: CsvRow[]
): AdjustedCompositeRatingRow[] {
  return rows.map((row) => ({
    sbName: row.sb_name,
    adjustedComposite: toNumber(row.adjusted_composite),
  }));
}

export function rowsToCooperNameMap(rows: CsvRow[]): CooperNameMapRow[] {
  return rows.map((row) => ({
    sbName: row.sb_name,
    teamKey: row.team_key,
  }));
}

export function mergeTeams(
  tournamentTeams: TournamentTeamRow[],
  ratings: AdjustedCompositeRatingRow[],
  cooperNameMap: CooperNameMapRow[]
): Team[] {
  const teamKeyBySbName = new Map(
    cooperNameMap.map((row) => [row.sbName, row.teamKey])
  );

  const ratingsByTeamKey = new Map<string, AdjustedCompositeRatingRow>();

  for (const row of ratings) {
    const teamKey = teamKeyBySbName.get(row.sbName);
    if (teamKey) {
      ratingsByTeamKey.set(teamKey, row);
    }
  }

  return tournamentTeams.map((team) => {
    const rating = ratingsByTeamKey.get(team.teamKey);

    if (!rating) {
      throw new Error(
        `Missing adjusted composite rating for ${team.displayName} (${team.teamKey})`
      );
    }

    return {
      id: team.teamKey,
      name: team.displayName,
      seed: team.seed,
      region: team.region,
      teamLogoId: team.teamLogoId,
      adjustedComposite: rating.adjustedComposite,
    };
  });
}