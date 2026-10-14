import { ArrowRight } from 'lucide-react';
import './SignUpPrompt.scss';
function SignUpPrompt() {
  return (
    <p className="signup-copy">
      New to RoundZero?{' '}
      <a href="#create-account">
        Create an account <ArrowRight size={14} />
      </a>
    </p>
  );
}
export default SignUpPrompt;
