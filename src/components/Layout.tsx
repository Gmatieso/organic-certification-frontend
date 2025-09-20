import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sprout, 
  ClipboardCheck, 
  Award, 
  Users, 
  MapPin,
  Menu,
  X,
  Leaf
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Farms', href: '/farms', icon: Sprout },
    { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
    { name: 'Certificates', href: '/certificates', icon: Award },
    { name: 'Farmers', href: '/farmers', icon: Users },
    { name: 'Fields', href: '/fields', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-pesiraGray50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-pesiraGray600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-pesiraWhite transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pesiraWhite"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-pesiraWhite" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-pesiraGreen to-pesiraEmerald p-2 rounded-lg">
                  <Leaf className="h-6 w-6 text-pesiraWhite" />
                </div>
                <span className="ml-3 text-xl font-bold text-pesiraGray900">AgriTrack</span>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-pesiraGreen200 to-pesiraEmarald50 text-pesiraBlack'
                        : 'text-gray-600 hover:text-pesiraGray'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-4 h-5 w-5 ${isActive ? 'text-pesiraGreen' : 'text-pesiraGray400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-pesiraGreen200 bg-pesiraWhite">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-pesiraGreen to-pesiraEmerald p-2 rounded-lg">
                  <Leaf className="h-6 w-6 text-pesiraWhite" />
                </div>
                <span className="ml-3 text-xl font-bold text-pesiraGray">AgriTrack</span>
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-pesiraGreen200 to-pesiraEmarald50 text-pesiraBlack'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-pesiraGray'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-pesiraGreen' : 'text-pesiraGray400 group-hover:text-pesiraGray500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-pesiraGray200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-pesiraGray500 hover:text-pesiraGray900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;