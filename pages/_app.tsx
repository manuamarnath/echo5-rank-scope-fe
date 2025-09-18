import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/components/auth/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}