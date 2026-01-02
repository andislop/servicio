import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar localStorage/cookies si manejas tokens
    // localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
      {/* Izquierda: Botón Hamburguesa (solo visible en móviles) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Derecha: Notificaciones y Perfil */}
      <div className="flex items-center gap-2">
        
        {/* Dropdown Notificaciones */}
        <div className="relative">
          <button 
            onClick={() => {setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false);}}
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-2 font-bold text-gray-700 border-b">Notificaciones</div>
              <div className="max-h-60 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-600 border-b">
                  Nueva familia registrada en el sector A.
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                  Recordatorio: Actualización de censo pendiente.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Perfil */}
        <div className="relative ml-3">
          <button 
            onClick={() => {setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false);}}
            className="flex items-center gap-2 rounded-full bg-gray-50 p-1 pr-3 hover:bg-gray-100 transition-all border border-gray-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <span className="text-xs font-bold">MP</span>
            </div>
            <span className="hidden text-sm font-medium text-gray-700 lg:block">María .i.</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 slide-in-top">
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                <Settings className="h-4 w-4" /> Configurar Perfil
              </button>
              <div className="my-1 border-t border-gray-100"></div>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;