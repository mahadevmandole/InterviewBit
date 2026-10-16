import Brand from '../../atoms/Brand/Brand';
import SignInFooter from '../../atoms/SignInFooter/SignInFooter';
import SignUpForm from '../../molecules/SignUpForm/SignUpForm';

function SignUpPanel() {
  return (
    <section className="form-panel" aria-label="Create account">
      <div className="mobile-brand">
        <Brand />
      </div>
      <div className="form-wrap">
        <header className="sign-in-header">
          <div className="welcome-badge">
            <span className="welcome-spark">✦</span> Start your next chapter
          </div>
          <h2 className="keyboard-heading" tabIndex={0}>
            Create your account<span className="heading-period">.</span>
          </h2>
          <p className="form-subtitle">Join to track progress and keep learning momentum.</p>
        </header>
        <SignUpForm />
      </div>
      <SignInFooter />
    </section>
  );
}

export default SignUpPanel;
