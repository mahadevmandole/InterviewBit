export type ExperienceLevel = 'Beginner' | 'Senior' | 'Expert';

export function getExperienceLevel(years: number): ExperienceLevel {
  if (years <= 1) return 'Beginner';
  if (years <= 5) return 'Senior';
  return 'Expert';
}
