import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import SocialSignIn from '../SocialSignIn/SocialSignIn';
import { login } from '../../../features/auth/authService';
import './SignInForm.scss';
function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    let result;
    try {
      result = await login(
        String(formData.get('email') || ''),
        String(formData.get('password') || ''),
        remember,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Sign in failed. Please try again.');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setError('');
    navigate('/dashboard');
  }
  return (
    <form onSubmit={handleSubmit}>
      <SocialSignIn />
      <div className="divider">
        <span /> <span className="divider-label">or sign in with email</span> <span />
      </div>
      <label className="field-label" htmlFor="email">
        Email address
      </label>
      <div className="input-wrap">
        <Mail className="input-icon" size={17} />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="password-label-row">
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <a className="text-link" href="#forgot-password">
          Forgot password?
        </a>
      </div>
      <div className="input-wrap">
        <LockKeyhole className="input-icon" size={17} />
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
        <button
          type="button"
          className="visibility-button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <label className="remember-row">
        <input
          className="remember-checkbox"
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <span>Keep me signed in</span>
      </label>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="submit-button" type="submit" tabIndex={0} disabled={isSubmitting}>
        <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
        <span className="submit-icon">
          {isSubmitting ? <LoaderCircle className="auth-loader-icon" size={17} /> : <ArrowRight size={17} />}
        </span>
      </button>
      <p className="demo-credentials">Demo: test@gmail.com · 123</p>
    </form>
  );
}
export default SignInForm;
