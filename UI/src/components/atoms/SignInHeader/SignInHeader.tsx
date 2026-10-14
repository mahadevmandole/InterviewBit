import { Sparkles } from 'lucide-react'
import './SignInHeader.scss'
function SignInHeader() {
  return <header className="sign-in-header"><div className="welcome-badge"><span className="welcome-spark"><Sparkles size={13} /></span> A fresh start looks good on you</div><h2>Welcome back<span className="heading-period">.</span></h2><p className="form-subtitle">Pick up right where your growth begins.</p></header>
}
export default SignInHeader
