import { ArrowUpRight, Sparkles } from 'lucide-react'
import Brand from '../../atoms/Brand/Brand'
import PracticeCard from '../../molecules/PracticeCard/PracticeCard'
import './StoryPanel.scss'
function SocialProof() {
  return <div className="social-proof"><div className="avatar-stack" aria-hidden="true"><span className="avatar avatar-one">A</span><span className="avatar avatar-two">R</span><span className="avatar avatar-three">S</span><span className="avatar avatar-four">K</span></div><div className="proof-copy"><strong>Good things start with practice.</strong><span>Join thousands getting interview-ready.</span></div></div>
}
function StoryFooter() {
  return <div className="story-footer"><span>© 2026 RoundZero</span><a href="mailto:hello@roundzero.com">Need a hand? <ArrowUpRight size={12} /></a></div>
}
function StoryPanel() {
  return <section className="story-panel" aria-label="RoundZero introduction"><div className="story-glow story-glow-one" /><div className="story-glow story-glow-two" /><div className="story-content"><Brand inverse /><div className="story-copy"><div className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</div><h1 className="keyboard-heading" tabIndex={0}>Make your next<br />interview <span>your best.</span></h1><p>Thoughtful practice. Real questions.<br className="desktop-break" /> A little more confidence every day.</p></div><PracticeCard /><SocialProof /><StoryFooter /></div><div className="decor-ring decor-ring-one" /><div className="decor-ring decor-ring-two" /></section>
}
export default StoryPanel
