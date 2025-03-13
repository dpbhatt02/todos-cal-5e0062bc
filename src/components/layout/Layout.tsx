
import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
    console.log('Create modal toggled, new state:', !isCreateModalOpen);
  };

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    // In a real app, you would dispatch an action or call an API
    setIsCreateModalOpen(false);
  };

  // Handle clicks outside the sidebar
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Only process if sidebar is open and click is outside sidebar
      if (isSidebarOpen && mainRef.current && mainRef.current.contains(event.target as Node)) {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div ref={sidebarRef}>
          <Sidebar 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar}
            openSidebar={openSidebar}
            toggleCreateModal={toggleCreateModal}
          />
        </div>
        <main 
          ref={mainRef}
          className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 
            ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
        >
          {children}
        </main>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Layout;
