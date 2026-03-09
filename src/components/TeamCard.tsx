import type { Team } from '../lib/types';

type TeamCardProps = {
  team: Team;
};

function TeamCard({ team }: TeamCardProps) {
  return (
    <section
      style={{
        padding: '1rem',
        marginBottom: '1rem',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '0.75rem',
      }}
    >
      <h2>{team.name}</h2>
      <p>Seed: {team.seed}</p>
      <p>Region: {team.region}</p>
      <p>Rating: {team.rating}</p>
    </section>
  );
}

export default TeamCard;