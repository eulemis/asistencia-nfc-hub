import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Users, Nfc, ScanLine } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = [
    { path: '/personas', label: 'Personas', icon: Users },
    { path: '/asociar-nfc', label: 'Asociar NFC', icon: Nfc },
    { path: '/escanear-nfc', label: 'Escanear NFC', icon: ScanLine },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Centro Juvenil Don Bosco</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center p-2 h-auto"
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm opacity-80">
        Bienvenido, {user.name}
      </div>
    </nav>
  );
};

export default Navigation;