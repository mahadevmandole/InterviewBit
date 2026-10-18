import { LoaderCircle } from 'lucide-react';
import './ApiLoader.scss';

function ApiLoader({ message }: { message: string }) {
  return (
    <div className="api-loader" role="status" aria-live="polite" aria-busy="true">
      <LoaderCircle className="api-loader__icon" size={26} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default ApiLoader;
