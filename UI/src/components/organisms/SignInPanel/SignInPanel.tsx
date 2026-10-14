import Brand from '../../atoms/Brand/Brand';
import SignInFooter from '../../atoms/SignInFooter/SignInFooter';
import SignInHeader from '../../atoms/SignInHeader/SignInHeader';
import SignUpPrompt from '../../atoms/SignUpPrompt/SignUpPrompt';
import SignInForm from '../../molecules/SignInForm/SignInForm';
import './SignInPanel.scss';
function SignInPanel() {
  return (
    <section className="form-panel" aria-label="Sign in">
      <div className="mobile-brand">
        <Brand />
      </div>
      <div className="form-wrap">
        <SignInHeader />
        <SignInForm />
        <SignUpPrompt />
      </div>
      <SignInFooter />
    </section>
  );
}
export default SignInPanel;
