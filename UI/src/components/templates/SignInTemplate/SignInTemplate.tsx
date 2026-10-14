import SignInPanel from '../../organisms/SignInPanel/SignInPanel'
import StoryPanel from '../../organisms/StoryPanel/StoryPanel'
import './SignInTemplate.scss'
function SignInTemplate() {
  return <main className="auth-shell"><StoryPanel /><SignInPanel /></main>
}
export default SignInTemplate
