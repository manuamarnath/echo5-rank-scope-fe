import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <>
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onToggleMode={toggleMode} />
      )}
    </>
  );
}