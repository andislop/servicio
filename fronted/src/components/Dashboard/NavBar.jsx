import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, Menu, Eye, X } from "lucide-react";
import Axios from "axios";

const Navbar = ({ nombreUsuario, onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  
  // Estados para el Modal de Detalle
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberFamily, setSelectedMemberFamily] = useState(null);
  const [modalType, setModalType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (nombreUsuario?.rol === "Administrador") {
      fetchSolicitudes();
    }
  }, [isNotifOpen, nombreUsuario]);

  const fetchSolicitudes = async () => {
    try {
      const res = await Axios.get(
        "http://localhost:3001/api/solicitudes-pendientes",
        { withCredentials: true }
      );
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
    }
  };

  const procesarAccion = async (id, accion) => {
    try {
      await Axios.post(
        "http://localhost:3001/api/procesar-solicitud",
        { id_solicitud: id, accion },
        { withCredentials: true }
      );
      fetchSolicitudes();
    } catch (err) {
      console.error("Error al procesar:", err);
      alert("Error al procesar");
    }
  };

  const handleLogout = async () => {
    try {
      await Axios.post("http://localhost:3001/api/logout", {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  // Función corregida para leer los datos del JSON de la base de datos
  const handleViewSolicitud = (solicitud) => {
    // Si datos_json viene como string desde la DB, lo convertimos a objeto
    const d = typeof solicitud.datos_json === 'string' 
      ? JSON.parse(solicitud.datos_json) 
      : solicitud.datos_json;

    const infoMiembro = {
      nombre: `${d.primerNombre || ''} ${d.primerApellido || ''}`.trim() || d.nombre_completo || "No especificado",
      cedula: d.cedula || "N/A",
      operacion: solicitud.tipo_operacion,
      telefono: d.telefono || "N/A",
      genero: d.sexo || "N/A",
      nacimiento: d.fechaNacimiento || "N/A"
    };

    const infoFamilia = {
      nombre_familia: d.nombreFamilia || "Familia Nueva",
      vivienda: d.vivienda || d.direccion || "No asignada",
    };

    setSelectedMember(infoMiembro);
    setSelectedMemberFamily(infoFamilia);
    setModalType("viewMember");
    setIsNotifOpen(false); // Cerrar dropdown al abrir modal
  };

  return (
    <>
      <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden">
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {nombreUsuario?.rol === "Administrador" && (
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 text-gray-600">
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
                  <div className="px-4 py-2 font-bold text-gray-700 border-b">Solicitudes de Gestión</div>
                  <div className="max-h-80 overflow-y-auto">
                    {solicitudes.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">No hay pendientes</div>
                    ) : (
                      solicitudes.map((sol) => (
                        <div key={sol.id_solicitud} className="px-4 py-3 border-b hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-800 font-semibold">{sol.primer_nombre} solicita:</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{sol.tipo_operacion}</p>
                            </div>
                            <button
                              onClick={() => handleViewSolicitud(sol)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => procesarAccion(sol.id_solicitud, "Aprobado")} className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded hover:bg-green-700">Aceptar</button>
                            <button onClick={() => procesarAccion(sol.id_solicitud, "Denegado")} className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded hover:bg-red-700">Denegar</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Perfil */}
          <div className="relative ml-3">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className="flex items-center gap-2 rounded-full bg-gray-50 p-1 pr-3 hover:bg-gray-100 border border-gray-200"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white overflow-hidden">
                <img
                  src={nombreUsuario.avatar || "https://placehold.co/100x100/3b82f6/ffffff?text=RG"}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-sm font-medium text-gray-700 hidden sm:block">{nombreUsuario.nombreCompleto}</div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-1 shadow-xl z-50">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                  <Settings className="h-4 w-4" /> Perfil
                </button>
                <div className="my-1 border-t border-gray-100"></div>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL DE INFORMACIÓN PROPUESTA */}
      {modalType === "viewMember" && selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">Información Propuesta</h2>
              <button onClick={() => setModalType("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500 text-sm">Nombre:</span>
                <span className="col-span-2 text-sm font-bold text-gray-900">{selectedMember.nombre}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500 text-sm">Cédula:</span>
                <span className="col-span-2 text-sm font-bold text-gray-900">{selectedMember.cedula}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500 text-sm">Operación:</span>
                <span className="col-span-2 text-sm font-bold text-blue-600 uppercase">Propuesto: {selectedMember.operacion}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500 text-sm">Familia:</span>
                <span className="col-span-2 text-sm font-bold text-gray-900">{selectedMemberFamily?.nombre_familia}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-500 text-sm">Vivienda:</span>
                <span className="col-span-2 text-sm font-bold text-gray-900">{selectedMemberFamily?.vivienda}</span>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-[10px] text-blue-700 font-medium uppercase tracking-widest mb-1">Datos Adicionales</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                   <p><span className="text-blue-400">Tlf:</span> {selectedMember.telefono}</p>
                   <p><span className="text-blue-400">Nac:</span> {selectedMember.nacimiento}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <button
                onClick={() => setModalType("")}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;