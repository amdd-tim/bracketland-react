import type { Matchup, Team } from './types';

export const teams: Team[] = [
  {
    id: 'duke',
    name: 'Duke',
    seed: 1,
    region: 'East',
    rating: 95,
  },
  {
    id: 'houston',
    name: 'Houston',
    seed: 1,
    region: 'South',
    rating: 94,
  },
  {
    id: 'uconn',
    name: 'UConn',
    seed: 1,
    region: 'West',
    rating: 96,
  },
  {
    id: 'gonzaga',
    name: 'Gonzaga',
    seed: 4,
    region: 'Midwest',
    rating: 90,
  },
];

export const roundOneMatchups: Matchup[] = [
  {
    id: 'matchup-1',
    teamA: teams[0],
    teamB: teams[1],
  },
  {
    id: 'matchup-2',
    teamA: teams[2],
    teamB: teams[3],
  },
];