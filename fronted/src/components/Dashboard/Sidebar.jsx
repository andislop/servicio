import React from "react";
import Logo from "../../assets/venezuela.png";
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
  "Manzaneros": User,
  Archivados: Archive,
  Configuración: Settings,
  "María .i.": User,
  "Agregar Contenido": Plus,
  "Usuarios en el Sistema": Users,
};
function Sidebar({ links, isOpen, onClose, userRole }) {

  const location = useLocation();

  const roleAccess = {
    'Administrador': [
      "Dashboard", "Jefes de Familia", "Núcleos Familiares", 
      "Manzaneros", "Usuarios en el Sistema", "Configuración", 
      "Archivados", "Agregar Contenido"
    ],
    'Jefe': [
      "Dashboard", "Jefes de Familia", "Núcleos Familiares","Configuración"
    ]
  };

  const filteredLinks = links.filter(link => 
    roleAccess[userRole]?.includes(link.title)
  );

  const navItems = filteredLinks.map((link) => ({
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 shadow-xl shadow-gray-200/50 flex-shrink-0 transition-transform duration-300 ease-in-out 
   
               md:relative md:translate-x-0 md:flex
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`} // Clases condicionales [cite: 185]
      >
        <div className="flex items-center justify-between p-6 border-b text-center">
          <div className="flex flex-col items-center md:flex-col md:items-center">
            <img
              src={Logo}
              alt="Logo de Comunidad Villa Productiva"
              className="w-[50px]"
            />
            <span className="ml-2 text-l font-semibold whitespace-nowrap hidden md:block text-dark pr-7">
              Comunidad Villa Productiva
            </span>
            <span className="text-sm font-semibold block md:hidden mt-1 text-dark">
              Comunidad Villa Productiva
            </span>
          </div>
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
              item.link === "." ? "/dashboard" : `/dashboard/${item.link}`;
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
                {/* --- MODIFICACIÓN DEL ICONO AQUÍ --- */}
                <div className="flex items-center mr-3 min-w-[44px]">
                  {item.title === "Agregar Contenido" ? (
                    <div className="flex items-center text-sm font-bold tracking-tight">
                      <span
                        className={isActive ? "text-white" : "text-blue-600"}
                      >
                        1
                      </span>
                      <Plus className="h-4 w-4 mx-0.5" />
                      <span
                        className={isActive ? "text-white" : "text-blue-600"}
                      >
                        8
                      </span>
                    </div>
                  ) : (
                    <item.icon className="h-5 w-5" />
                  )}
                </div>
                {/* ---------------------------------- */}
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

        <div className="p-4 border-t text-sm text-gray-500 flex justify-end"></div>
      </nav>
    </>
  );
}

export default Sidebar;
