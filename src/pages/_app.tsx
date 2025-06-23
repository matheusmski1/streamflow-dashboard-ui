import { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';
import StoreProvider from '@/components/StoreProvider';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </StoreProvider>
  );
} 