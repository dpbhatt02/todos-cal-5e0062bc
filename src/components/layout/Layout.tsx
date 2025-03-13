
import { useState } from 'react';
import Sidebar from './Sidebar';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    // In a real app, you would dispatch an action or call an API
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar}
          toggleCreateModal={toggleCreateModal}
        />
        <main 
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
