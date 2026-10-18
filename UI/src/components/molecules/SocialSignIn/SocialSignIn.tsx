import { Code2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import './SocialSignIn.scss';
const providers = [
  {
    name: 'Google',
    icon: (
      <span className="google-mark" aria-hidden="true">
        G
      </span>
    ),
  },
  { name: 'GitHub', icon: <Code2 size={18} strokeWidth={2.1} aria-hidden="true" /> },
];
function SocialProviderButton({ name, icon }: { name: string; icon: ReactNode }) {
  return (
    <Button variant="outline" className="social-button" type="button">
      {icon}
      <span>Continue with {name}</span>
    </Button>
  );
}
function SocialSignIn() {
  return (
    <div className="social-buttons">
      {providers.map((provider) => (
        <SocialProviderButton key={provider.name} {...provider} />
      ))}
    </div>
  );
}
export default SocialSignIn;
