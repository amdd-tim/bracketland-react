import type { Team } from './types';

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  const lines = trimmedText.split(/\r?\n/);
  const headers = lines[0].split(',').map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());

    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

export function rowsToTeams(rows: CsvRow[]): Team[] {
  return rows.map((row, index) => ({
    id: row.id || row.name?.toLowerCase().replace(/\s+/g, '-') || `team-${index}`,
    name: row.name || 'Unknown Team',
    seed: Number(row.seed || 0),
    region: row.region || '',
    rating: Number(row.rating || 0),
  }));
}