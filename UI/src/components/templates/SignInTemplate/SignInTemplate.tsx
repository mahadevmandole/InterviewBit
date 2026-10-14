import SignInPanel from '../../organisms/SignInPanel/SignInPanel'
import StoryPanel from '../../organisms/StoryPanel/StoryPanel'
import './SignInTemplate.scss'
function SignInTemplate() {
  return <><a className="skip-link" href="#main-content">Skip to sign in</a><main className="auth-shell" id="main-content" tabIndex={-1}><StoryPanel /><SignInPanel /></main></>
}
export default SignInTemplate
