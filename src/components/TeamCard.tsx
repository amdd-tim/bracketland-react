import type { Team } from '../lib/types';

type TeamCardProps = {
  team: Team;
};

function TeamCard({ team }: TeamCardProps) {
  return (
    <section>
      <h2>{team.name}</h2>
      <p>Seed: {team.seed}</p>
      <p>Region: {team.region}</p>
      <p>Rating: {team.rating}</p>
    </section>
  );
}

export default TeamCard;