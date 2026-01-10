import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Settings, Menu } from "lucide-react";
import Axios from "axios";

const Navbar = ({ nombreUsuario, onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (nombreUsuario?.rol === "Administrador") {
      fetchSolicitudes();
    }
  }, [isNotifOpen]);

  const fetchSolicitudes = async () => {
    const res = await Axios.get("http://localhost:3001/api/solicitudes-pendientes", {
      withCredentials: true,
    });
    setSolicitudes(res.data);
  };

  const procesarAccion = async (id, accion) => {
    try {
      await Axios.post(
        "http://localhost:3001/api/procesar-solicitud",
        { id_solicitud: id, accion },
        { withCredentials: true }
      );
      fetchSolicitudes(); // Recargar lista
    } catch (err) {
       console.error("Error al :", err);
      alert("Error al procesar");
    }
  };

  const handleLogout = async () => {
    try {
      await Axios.post(
        "http://localhost:3001/api/logout",
        {},
        { withCredentials: true }
      );
      // Limpiamos cualquier estado local si existe y redirigimos
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
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
        {nombreUsuario?.rol === "Administrador" && (
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-gray-600"
            >
              <Bell className="h-5 w-5" />
              {solicitudes.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative h-3 w-3 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center">
                    {solicitudes.length}
                  </span>
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white py-2 shadow-xl z-50">
                <div className="px-4 py-2 font-bold text-gray-700 border-b">
                  Solicitudes de Registro
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {solicitudes.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                      No hay pendientes
                    </div>
                  ) : (
                    solicitudes.map((sol) => (
                      <div
                        key={sol.id_solicitud}
                        className="px-4 py-3 border-b hover:bg-gray-50"
                      >
                        <p className="text-sm text-gray-800 font-medium">
                          {sol.primer_nombre} solicita registrar:
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Familia {JSON.parse(sol.datos_json).nombreFamilia}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              procesarAccion(sol.id_solicitud, "Aprobado")
                            }
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() =>
                              procesarAccion(sol.id_solicitud, "Denegado")
                            }
                            className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Denegar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dropdown Perfil */}
        <div className="relative ml-3">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-full bg-gray-50 p-1 pr-3 hover:bg-gray-100 transition-all border border-gray-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <img
                src={
                  nombreUsuario.avatar ||
                  "https://placehold.co/100x100/3b82f6/ffffff?text=RG"
                }
                alt={nombreUsuario.nombreCompleto}
                className="h-5 w-5 sm:h-7 sm:w-7 rounded-full object-cover shadow-sm flex-shrink-0"
              />
            </div>
            <div className="text-sm font-medium text-gray-700 lg:block">
              {nombreUsuario.nombreCompleto}
            </div>
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
