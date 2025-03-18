
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/toaster';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AuthLayout from './components/layout/AuthLayout';

// Page Components
import Index from './pages/Index';
import Tasks from './pages/Tasks';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Kanban from './pages/Kanban';
import TagTasks from './pages/TagTasks';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import GoogleCalendarCallback from './pages/GoogleCalendarCallback';
import NotFound from './pages/NotFound';
import History from './pages/History';

// Context Providers
import { AuthProvider } from '@/contexts/AuthContext';

// MainLayout for authenticated pages with sidebar
function MainLayout() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        openSidebar={openSidebar}
        toggleCreateModal={toggleCreateModal}
      />
      <div
        className={cn(
          "flex flex-col flex-1 overflow-x-hidden transition-transform duration-300",
          isSidebarOpen ? "lg:ml-64" : "ml-20"
        )}
      >
        <Header toggleSidebar={toggleSidebar} toggleCreateModal={toggleCreateModal} />
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-react-tailwind-theme"
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes without sidebar */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Main application routes with sidebar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/tags/:tagId" element={<TagTasks />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth/google-calendar-callback" element={<GoogleCalendarCallback />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
