import { useParams } from 'react-router-dom'
import './DashboardSectionPage.scss'

const sectionContent: Record<string, { title: string; description: string }> = {
  history: { title: 'My practice', description: 'Your completed and in-progress interview sessions will appear here.' },
  progress: { title: 'Progress', description: 'Track your practice streaks and answer feedback here.' },
  settings: { title: 'Settings', description: 'Manage your profile and interview preferences here.' },
}

function DashboardSectionPage() {
  const { section = '' } = useParams()
  const content = sectionContent[section] ?? { title: 'Page not found', description: 'Choose another section from the navigation.' }
  return <section className="section-placeholder"><span className="section-kicker">ROUNDZERO WORKSPACE</span><h1 className="keyboard-heading" tabIndex={0}>{content.title}</h1><p>{content.description}</p></section>
}

export default DashboardSectionPage
