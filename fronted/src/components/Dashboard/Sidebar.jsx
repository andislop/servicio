import React from "react";
import {
  Home,
  Users,
  Archive,
  Settings,
  LayoutDashboard,
  Plus,
  User,
  Clock,
  Download,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ChevronRight,
  FileText,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const iconMap = {
  Dashboard: LayoutDashboard,
  "Jefes de Familia": Users,
  "Núcleos Familiares": Home,
  Archivados: Archive,
  Configuración: Settings,
  "María .i.": User,
  "Agregar Contenido": Plus,
  "Usuarios en el Sistema": Users,
};
function Sidebar({ links, isOpen, onClose }) { // Recibe isOpen y onClose [cite: 180]
  const location = useLocation();
const navItems = links.map((link) => ({
    ...link,
    icon: iconMap[link.title] || LayoutDashboard,
  }));
const isLinkActive = (linkPath) => {
    const currentPathSegment = location.pathname.replace("/dashboard", "");
if (linkPath === ".") {
      return currentPathSegment === "/" || currentPathSegment === "";
}
    return currentPathSegment.startsWith(`/${linkPath}`);
  };

  return (
    <>
      {/* Overlay Oscuro: Muestra solo cuando el sidebar está abierto y en móvil [cite: 185] */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={onClose} // Cierra al hacer clic en el overlay
        ></div>
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-gray-200 shadow-xl shadow-gray-200/50 flex-shrink-0 transition-transform duration-300 ease-in-out 
   
               md:relative md:translate-x-0 md:flex
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`} // Clases condicionales [cite: 185]
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-black text-gray-800">Control Familiar</h1>
          {/* Botón de Cerrar: Visible solo en móviles [cite: 186] */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={onClose}
        
         aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-2 flex-grow overflow-y-auto">
          <div className="px-3 py-1 text-xs font-semibold uppercase text-gray-400">
            Gestión Comunitaria
          </div>

 
          {navItems.map((item) => {
            const targetPath =
              item.link === "." ?
 "/dashboard" : `/dashboard/${item.link}`;
            const isActive = isLinkActive(item.link);

            return (
              <Link
                key={item.title}
                to={targetPath}
                onClick={onClose} // Cierra el sidebar al navegar a un enlace
                className={`flex items-center w-full px-3 py-3 rounded-xl transition-colors font-medium ${
      
                 isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-gray-600 hover:bg-gray-300"
                }`}
              >
            
             <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-grow text-left">{item.title}</span>

                {item.count && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
             
                   isActive
                        ? "bg-white text-blue-600"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
 
                    {item.count}
                  </span>
                )}
              </Link>
            );
 })}
        </div>

        <div className="p-4 border-t text-sm text-gray-500 flex justify-end">
          <button className="text-gray-400 hover:text-gray-600">
            <Clock className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </>
  );
 }

export default Sidebar;