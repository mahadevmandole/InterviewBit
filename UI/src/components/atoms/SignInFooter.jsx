import { LockKeyhole } from 'lucide-react'
function SignInFooter() {
  return <footer className="form-footer"><span>By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</span><span className="secure-note"><LockKeyhole size={12} /> Secure sign in</span></footer>
}
export default SignInFooter
