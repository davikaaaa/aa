import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      <LoginForm />
    </div>
  );
};

export default Login;