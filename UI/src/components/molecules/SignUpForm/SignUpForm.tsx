import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, User } from 'lucide-react';
import { register } from '../../../features/auth/authService';
import '../SignInForm/SignInForm.scss';

function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const firstName = String(formData.get('first_name') || '').trim();
    const lastName = String(formData.get('last_name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (firstName.length < 2) {
      setError('First name must be at least 2 characters long.');
      return;
    }

    if (lastName.length < 2) {
      setError('Last name must be at least 2 characters long.');
      return;
    }

    const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,}$/;
    if (!phonePattern.test(phone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least 8 characters, one letter, and one number.');
      return;
    }

    setIsSubmitting(true);
    let result;
    try {
      result = await register({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        password,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Account creation failed. Please try again.');
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
    <form onSubmit={handleSubmit} noValidate>
      <div className="signup-grid">
        <div>
          <label className="field-label" htmlFor="first_name">
            First name
          </label>
          <div className="input-wrap">
            <User className="input-icon" size={17} />
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              required
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="last_name">
            Last name
          </label>
          <div className="input-wrap">
            <User className="input-icon" size={17} />
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              required
            />
          </div>
        </div>
      </div>

      <label className="field-label" htmlFor="phone">
        Phone number
      </label>
      <div className="input-wrap">
        <Phone className="input-icon" size={17} />
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          autoComplete="tel"
          required
        />
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

      <label className="field-label" htmlFor="password">
        Password
      </label>
      <div className="input-wrap">
        <LockKeyhole className="input-icon" size={17} />
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Create a strong password"
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

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button className="submit-button" type="submit" tabIndex={0} disabled={isSubmitting}>
        <span>{isSubmitting ? 'Creating account…' : 'Create account'}</span>
        <span className="submit-icon">
          {isSubmitting ? <LoaderCircle className="auth-loader-icon" size={17} /> : <ArrowRight size={17} />}
        </span>
      </button>

      <p className="signup-copy">
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}

export default SignUpForm;
