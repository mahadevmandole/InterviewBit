import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Technology } from '../../../features/interviews/technologyCatalog';
import './TechnologyCard.scss';

interface TechnologyCardProps {
  technology: Technology;
}

function TechnologyCard({ technology }: TechnologyCardProps) {
  const Icon = technology.icon;
  return (
    <Link
      className="technology-card"
      to={`/practice/${technology.id}`}
      tabIndex={0}
      aria-label={`Start ${technology.name} interview practice`}
    >
      <span
        className="technology-icon"
        style={{ color: technology.color, backgroundColor: technology.background }}
      >
        <Icon size={23} strokeWidth={2} />
      </span>
      <span className="technology-category">{technology.category}</span>
      <strong>{technology.name}</strong>
      <span className="technology-description">{technology.description}</span>
      <span className="technology-action">
        Start practice <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}

export default TechnologyCard;
