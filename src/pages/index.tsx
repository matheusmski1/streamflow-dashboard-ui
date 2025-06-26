import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import Head from 'next/head';

export default function LoginPage() {
  useAuth(false);

  return (
    <>
      <Head>
        <title>Login | StreamFlow</title>
      </Head>
      <LoginForm />
    </>
  );
} 