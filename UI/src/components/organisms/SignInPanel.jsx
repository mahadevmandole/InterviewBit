import Brand from '../atoms/Brand.jsx'
import SignInFooter from '../atoms/SignInFooter.jsx'
import SignInHeader from '../atoms/SignInHeader.jsx'
import SignUpPrompt from '../atoms/SignUpPrompt.jsx'
import SignInForm from '../molecules/SignInForm.jsx'
function SignInPanel() {
  return <section className="form-panel" aria-label="Sign in"><div className="mobile-brand"><Brand /></div><div className="form-wrap"><SignInHeader /><SignInForm /><SignUpPrompt /></div><SignInFooter /></section>
}
export default SignInPanel
