import StoryPanel from '../../components/organisms/StoryPanel/StoryPanel';
import SignUpPanel from '../../components/organisms/SignUpPanel/SignUpPanel';

function SignUpPage() {
  return (
    <div className="sign-in-page">
      <main className="auth-shell" id="main-content" tabIndex={-1}>
        <StoryPanel />
        <SignUpPanel />
      </main>
    </div>
  );
}

export default SignUpPage;
