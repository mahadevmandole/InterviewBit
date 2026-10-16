import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SignUpPrompt.scss';
function SignUpPrompt() {
  return (
    <p className="signup-copy">
      New to RoundZero?{' '}
      <Link to="/signup">
        Create an account <ArrowRight size={14} />
      </Link>
    </p>
  );
}
export default SignUpPrompt;
