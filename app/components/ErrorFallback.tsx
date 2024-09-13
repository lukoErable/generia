import { FC } from 'react';

interface ErrorFallbackProps {
  error: Error;
}

export const ErrorFallback: FC<ErrorFallbackProps> = ({ error }) => (
  <div className="text-red-500 p-4">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);
