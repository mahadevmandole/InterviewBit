import { ArrowRight, Flame, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import TechnologyCard from '../../components/molecules/TechnologyCard/TechnologyCard';
import { technologies } from '../../features/interviews/technologyCatalog';
import './DashboardPage.scss';

function DashboardPage() {
  const [query, setQuery] = useState('');
  const filteredTechnologies = useMemo(
    () =>
      technologies.filter((technology) =>
        `${technology.name} ${technology.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <span className="dashboard-breadcrumb">
          Workspace <span>/</span> Dashboard
        </span>
        <div className="topbar-avatar">L</div>
      </header>
      <section className="dashboard-welcome">
        <div>
          <div className="dashboard-eyebrow">
            <Sparkles size={14} /> YOUR PRACTICE SPACE
          </div>
          <h1 className="keyboard-heading" tabIndex={0}>
            Ready when you are, <span>Learner.</span>
          </h1>
          <p>Choose a technology and start a focused interview practice session.</p>
        </div>
        <div className="streak-card">
          <div className="streak-icon">
            <Flame size={18} />
          </div>
          <div>
            <strong>Build your rhythm</strong>
            <span>A little practice goes a long way.</span>
          </div>
        </div>
      </section>
      <div className="tech-section-heading">
        <div>
          <h2 className="keyboard-heading" tabIndex={0}>
            Choose your tech stack
          </h2>
          <p>Each session has 10 curated questions.</p>
        </div>
        <label className="tech-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a technology"
            aria-label="Find a technology"
          />
        </label>
      </div>
      {filteredTechnologies.length ? (
        <div className="technology-grid">
          {filteredTechnologies.map((technology) => (
            <TechnologyCard key={technology.id} technology={technology} />
          ))}
        </div>
      ) : (
        <div className="empty-search">No technologies match “{query}”. Try another search.</div>
      )}
      <div className="dashboard-tip">
        <span className="tip-icon">
          <Sparkles size={15} />
        </span>
        <span>
          <strong>Practice tip</strong> Say your reasoning out loud. Clear thinking matters as much
          as the final answer.
        </span>
        <ArrowRight size={15} />
      </div>
    </div>
  );
}

export default DashboardPage;
