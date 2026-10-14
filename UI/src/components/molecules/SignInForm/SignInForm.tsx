import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import SocialSignIn from '../SocialSignIn/SocialSignIn'
import './SignInForm.scss'
function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault() }
  return <form onSubmit={handleSubmit}><SocialSignIn /><div className="divider"><span /> <span className="divider-label">or sign in with email</span> <span /></div><label className="field-label" htmlFor="email">Email address</label><div className="input-wrap"><Mail className="input-icon" size={17} /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div><div className="password-label-row"><label className="field-label" htmlFor="password">Password</label><a className="text-link" href="#forgot-password">Forgot password?</a></div><div className="input-wrap"><LockKeyhole className="input-icon" size={17} /><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" className="visibility-button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><button className="remember-row" type="button" onClick={() => setRemember((value) => !value)} aria-pressed={remember}><span className={`custom-checkbox ${remember ? 'checked' : ''}`}>{remember && <Check size={12} strokeWidth={3} />}</span><span>Keep me signed in</span></button><button className="submit-button" type="submit"><span>Sign in</span><span className="submit-icon"><ArrowRight size={17} /></span></button></form>
}
export default SignInForm
