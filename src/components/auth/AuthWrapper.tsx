import { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

export default function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <>
      {isLogin ? (
        <SignIn onToggleMode={toggleMode} />
      ) : (
        <SignUp onToggleMode={toggleMode} />
      )}
    </>
  );
}