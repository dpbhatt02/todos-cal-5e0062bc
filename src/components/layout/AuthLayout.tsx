
import React from 'react';
import { Outlet } from 'react-router-dom';

type AuthLayoutProps = {
  children?: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {children ? children : <Outlet />}
    </div>
  );
};

export default AuthLayout;
