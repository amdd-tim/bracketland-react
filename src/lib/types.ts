export type Team = {
  id: string;
  name: string;
  seed: number;
  region: string;
  cooperRating: number;
};

export type Matchup = {
  id: string;
  teamA?: Team;
  teamB?: Team;
  winner?: Team;
};

export type Bracket = {
  teams: Team[];
  matchups: Matchup[];
};