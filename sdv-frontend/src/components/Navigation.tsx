import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CreditCard, 
  GraduationCap, 
  BookOpen, 
  UserCircle, 
  CheckSquare, 
  UserCheck, 
  Bell, 
  LogOut,
  Menu,
  X,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Navigation = ({ activeSection, setActiveSection, onLogout }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'alumnos', label: 'Alumnos', icon: Users },
    { id: 'mensualidades', label: 'Mensualidades', icon: CreditCard },
    { id: 'seminarios', label: 'Seminarios', icon: BookOpen },
    { id: 'diplomado', label: 'Diplomados', icon: GraduationCap },
    { id: 'horarios', label: 'Horarios', icon: Calendar },
    { id: 'ver-perfil', label: 'Ver Perfil', icon: UserCircle },
    { id: 'asistencias', label: 'Asistencias', icon: CheckSquare },
    { id: 'lista-maestros', label: 'Lista de Maestros', icon: UserCheck },
    { id: 'avisos', label: 'Avisos', icon: Bell },
  ];

  const handleMenuClick = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/sdv_logo.png" alt="SDV Logo" className="h-20 w-auto" />
            </div>
            
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveSection(item.id)}
                    className={`h-10 px-3 flex items-center space-x-2 transition-all duration-200 ${
                      activeSection === item.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/sdv_logo.png" alt="SDV Logo" className="h-16 w-auto" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="h-10 w-10 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1 max-h-96 overflow-y-auto">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full h-12 px-4 flex items-center space-x-3 justify-start transition-all duration-200 ${
                      activeSection === item.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-base font-medium">{item.label}</span>
                  </Button>
                );
              })}
              
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full h-12 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-3 justify-start"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base font-medium">Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
