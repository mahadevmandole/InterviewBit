import { ArrowUpRight, Zap } from 'lucide-react'
function PracticeCard() {
  return <div className="interview-card" aria-hidden="true"><div className="card-topline"><div className="live-label"><span className="live-dot" /> YOUR PRACTICE ROOM</div><div className="card-menu"><i /><i /><i /></div></div><div className="card-question-row"><div className="question-number">01<span> / 10</span></div><span className="question-tag"><Zap size={12} fill="currentColor" /> JavaScript</span></div><div className="question-skeleton"><i /><i /><i /></div><div className="answer-line"><span className="answer-cursor" /> <span>Write your answer...</span></div><div className="card-bottomline"><span>Take your time. You’ve got this.</span><span className="tiny-arrow"><ArrowUpRight size={15} /></span></div></div>
}
export default PracticeCard
