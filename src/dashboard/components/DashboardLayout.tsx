import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './SideBar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e]">
      {/* Navbar fijo en la parte superior */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="flex flex-grow pt-16"> {/* pt-16 para compensar la altura del navbar fijo */}
        {/* Sidebar fijo al lado izquierdo */}
        <div className="fixed left-0 top-16 bottom-0 z-40 hidden md:block">
          <Sidebar className="h-full" />
        </div>

        {/* Contenido principal con margen izquierdo para compensar sidebar en desktop */}
        <div className="flex-1 md:ml-64 p-4 md:p-6 mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;