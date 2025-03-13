
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out mt-16 p-4 md:p-6 
            ${isSidebarOpen ? 'md:ml-64' : ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
