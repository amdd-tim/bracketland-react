export type Team = {
  id: string;
  name: string;
  seed: number;
  region: string;
  cooperRating: number;
  teamLogoId: string;
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