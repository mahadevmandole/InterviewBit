import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Technology } from '../../../features/interviews/technologyCatalog';
import './TechnologyCard.scss';

interface TechnologyCardProps {
  technology: Technology;
  onSelect?: (technology: Technology) => void;
}

function TechnologyCard({ technology, onSelect }: TechnologyCardProps) {
  const Icon = technology.icon;

  return (
    <Button
      type="button"
      variant="ghost"
      className="technology-card"
      onClick={() => onSelect?.(technology)}
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
    </Button>
  );
}

export default TechnologyCard;
