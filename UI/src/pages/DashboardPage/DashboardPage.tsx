import { ArrowRight, Flame, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TechnologyCard from '../../components/molecules/TechnologyCard/TechnologyCard';
import { getExperienceLevel, type ExperienceLevel } from '../../features/interviews/experienceLevel';
import type { Technology } from '../../features/interviews/technologyCatalog';
import { technologies } from '../../features/interviews/technologyCatalog';
import './DashboardPage.scss';

function DashboardPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
  const [experienceYears, setExperienceYears] = useState('');

  const filteredTechnologies = useMemo(
    () =>
      technologies.filter((technology) =>
        `${technology.name} ${technology.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const experienceLevel = experienceYears === '' ? null : getExperienceLevel(Number(experienceYears));

  const handleStartPractice = () => {
    if (!selectedTechnology) return;

    const years = Number(experienceYears || 0);
    const level: ExperienceLevel = getExperienceLevel(years);

    setSelectedTechnology(null);
    setExperienceYears('');
    navigate(`/practice/${selectedTechnology.id}?years=${years}&level=${level}`);
  };

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
            <TechnologyCard
              key={technology.id}
              technology={technology}
              onSelect={setSelectedTechnology}
            />
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

      {selectedTechnology && (
        <div className="experience-modal-overlay" onClick={() => setSelectedTechnology(null)}>
          <div
            className="experience-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Experience setup"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="experience-modal-header">
              <div>
                <span>Experience setup</span>
                <h3>{selectedTechnology.name}</h3>
              </div>
              <button
                type="button"
                className="experience-close-button"
                onClick={() => setSelectedTechnology(null)}
                aria-label="Close experience setup"
              >
                ×
              </button>
            </div>

            <label className="experience-field" htmlFor="experience-years">
              Total experience (years)
              <input
                id="experience-years"
                type="number"
                min="0"
                step="1"
                value={experienceYears}
                onChange={(event) => setExperienceYears(event.target.value)}
                placeholder="e.g. 3"
              />
            </label>

            {experienceLevel && (
              <div className="experience-badge" aria-live="polite">
                {experienceLevel}
              </div>
            )}

            <div className="experience-actions">
              <button
                type="button"
                className="experience-secondary-button"
                onClick={() => setSelectedTechnology(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="experience-primary-button"
                onClick={handleStartPractice}
              >
                Start practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
