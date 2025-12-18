import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// Importamos el ícono de Menú para el botón de responsive
import { Menu } from "lucide-react"; 
import DashboardView from "./DashboardView";
import ArchivedView from "./ArchivedView";
import FamilyHeadsView from "./FamilyHeadsView";
import AddFamilyHeadModal from "./AddFamilyHeadModal";
import EditFamilyHeadModal from "./EditFamilyHeadModal";
import FamilyNucleusView from "./FamilyNucleusView";
import SettingsView from "./SettingsView";
import Sidebar from "./Sidebar";
import MemberDetailModal from "./MemberDetailModal";
import ImageUploadPage from "./ImageUploadPage";
import Axios from "axios";
import Users from "./Users";
import { Link } from "react-router-dom";
// Se importa Link, aunque no se usa directamente aquí, es buena práctica.
// 🚨 AJUSTE DE RUTAS: Usaremos el punto '.' para la ruta base anidada
const links = [
  {
    id: 1,
    title: "Dashboard",
    link: ".", 
  },
  {
    id: 2,
    title: "Jefes de Familia",
    link: "family-heads", 
  },
  {
    id: 3,
    title: "Núcleos Familiares",
    link: "family-nucleus", 
  },
  {
    id: 4,
    title: "Archivados",
    link: "archived", 
  },
  {
    id: 5,
    title: "Configuración",
    link: "settings", 
  },
  {
    id: 6,
    title: "Agregar Contenido",
    link: "upload-content", 
  },
  {
    id: 8,
    title: "María .i.",
    link: "profile",
  },
  {
    id: 7,
    title: "Usuarios en el Sistema",
    link: "users",
  }
];
const API_BASE_URL = "http://localhost:3001/api/jefes";

const Dashboard = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [selectedHead, setSelectedHead] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberFamily, setSelectedMemberFamily] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Función para alternar el estado del Sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const fetchFamiliesAndHeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get(API_BASE_URL);
      const jefesFromApi = response.data;
      const transformedFamilies = jefesFromApi.map((jefe) => {
        const isHead = true;
        const familyName = jefe.nombreFamilia || "Núcleo Desconocido";
        const memberStatus = jefe.estado || "Activo";
        const familyId = jefe.id_familia 
|| jefe.id;

        return {
          id: familyId,
          name: familyName,
          address: jefe.direccion || "N/A",
          membersCount: 1,
          activeMembers: memberStatus === "Activo" ? 1 : 0,
          notes: jefe.notas || "",
          registeredDate:
    
         jefe.registeredDate || new Date().toISOString().split("T")[0],
          members: [
            {
              id: jefe.id,
              name: jefe.nombre || "",
              role: "Jefe de Familia",
              status: memberStatus,
  
              email: jefe.email ||
"",
              phone: jefe.telefono ||
"",
              dob: jefe.fechaNacimiento ||
null,
              occupation: jefe.ocupacion ||
"",
              isHead,
              avatar: `https://placehold.co/100x100/3b82f6/ffffff?text=${(
                jefe.nombre || "J"
              )
                .split(" ")
                .map((n) => n[0])
    
             .join("")}`,
              raw: jefe,
            },
          ],
        };
});

      setFamilies(transformedFamilies);
    } catch (error) {
      console.error(
        "Error al cargar datos desde la API:",
        error.response?.data || error.message
      );
 alert(
        "Error al conectar con la API o al cargar datos. Revisa la consola para más detalles."
      );
 setFamilies([]);
    } finally {
      setLoading(false);
    }
  }, []);
 useEffect(() => {
    fetchFamiliesAndHeads();
  }, [fetchFamiliesAndHeads]);
 const familyHeads = useMemo(() => {
    return families.flatMap((f) =>
      f.members
        .filter((m) => m.isHead)
        .map((head) => ({
          ...head,
          nombreFamilia: f.name,
          address: f.address,
          notes: f.notes,
        }))
    );
  }, [families]);
 // [Lógica para modales y guardar/archivar... se mantienen igual]

  const handleOpenAddHead = useCallback(() => {
    setSelectedHead(null);
    setModalType("addHead");
  }, []);
 const handleOpenEditHead = useCallback((head) => {
    const original = head.raw ?? head;
    setSelectedHead(original);
    setModalType("editHead");
  }, []);
 const handleOpenViewMember = useCallback((member, family) => {
    setSelectedMember(member);
    setSelectedMemberFamily(family);
    setModalType("viewMember");
  }, []);
 const handleCloseModal = useCallback(() => {
    setModalType(null);
    setSelectedHead(null);
    setSelectedMember(null);
    setSelectedMemberFamily(null);
  }, []);
 const handleSaveHead = async (familyHeadData) => {
    const isNew = !familyHeadData.id;
 const dataToSend = {
      nombre: familyHeadData.name ?? familyHeadData.nombre ??
"",
      fechaNacimiento:
        familyHeadData.dob ?? familyHeadData.fechaNacimiento ??
null,
      ocupacion: familyHeadData.occupation ?? familyHeadData.ocupacion ?? null,
      email: familyHeadData.email ??
null,
      telefono: familyHeadData.phone ?? familyHeadData.telefono ?? null,
      estado: familyHeadData.status ??
familyHeadData.estado ?? "Activo",
      nombreFamilia:
        familyHeadData.familyName ?? familyHeadData.nombreFamilia ??
"",
      direccion: familyHeadData.address ?? familyHeadData.direccion ?? null,
      notas: familyHeadData.notes ??
familyHeadData.notas ?? null,
    };

    try {
      if (isNew) {
        await Axios.post(API_BASE_URL, dataToSend);
 alert("Jefe de familia registrado con éxito!");
      } else {
        await Axios.put(`${API_BASE_URL}/${familyHeadData.id}`, dataToSend);
 alert("Jefe de familia actualizado con éxito!");
      }
      handleCloseModal();
      fetchFamiliesAndHeads();
 } catch (error) {
      console.error(
        "Error salvando/actualizando el familiar:",
        error.response?.data || error.message
      );
 alert(
        `Error al guardar los datos: ${
          error.response?.data?.message || error.message
        }. Revisa la consola.`
      );
 }
  };

  const handleArchiveHead = async (head) => {
    const apiData = {
      nombre: head.name ??
 head.nombre ?? "",
      fechaNacimiento: head.dob ?? head.fechaNacimiento ??
 null,
      ocupacion: head.occupation ?? head.ocupacion ?? null,
      email: head.email ??
 null,
      telefono: head.phone ?? head.telefono ??
 null,
      estado: "Inactivo",
      nombreFamilia: head.nombreFamilia ?? head.familyName ??
 "",
      direccion: head.address ?? head.direccion ?? null,
      notas: head.notes ??
 head.notas ?? null,
    };

    try {
      await Axios.put(`${API_BASE_URL}/${head.id}`, apiData);
 alert(
        `Jefe de familia ${
          head.name || head.nombre
        } archivado con éxito (estado Inactivo)!`
      );
 fetchFamiliesAndHeads();
    } catch (error) {
      console.error(
        "Error al archivar el familiar:",
        error.response?.data || error.message
      );
 alert(
        `Error al archivar: ${
          error.response?.data?.message || error.message
        }. Revisa la consola.`
      );
 }
  }; // Función para determinar la vista actual y pasarla al Sidebar para resaltar el enlace

  const location = useLocation();
 const getActiveLink = () => {
    // 🚨 CORRECCIÓN CLAVE: Buscamos el segmento de la ruta después de /dashboard
    const currentPathSegment = location.pathname.split("/dashboard")[1] ||
 "/";

    // Eliminamos la barra inicial si existe, para comparar con 'family-heads'
    const cleanPath = currentPathSegment.startsWith("/")
      ?
 currentPathSegment.substring(1)
      : currentPathSegment; // Buscamos el link que coincida.
 const activeLink = links.find(
      (l) =>
        // 1. Si el link es '.', coincide con la ruta base limpia (que sería '')
        (l.link === "." && cleanPath === "") ||
        // 2. Si el link es un nombre de ruta (ej: 'family-heads'), coincide con el path limpio
        l.link === cleanPath
    );
 return activeLink ? activeLink.title : "";
  }; // Usamos el título del enlace activo para resaltarlo en el Sidebar
  const currentViewTitle = getActiveLink();
 // ------------------------------------------------------------- // 🚨 AJUSTE PRINCIPAL: Sustitución de renderContent por <Routes> // -------------------------------------------------------------

  const ContentRouter = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <p className="text-xl text-blue-600">
            Cargando datos del servidor... 

          </p>

        </div>
      );
 }

    return (
      <Routes>

    <Route path="/" element={<DashboardView toggleSidebar={toggleSidebar} />} />
        <Route
          path="family-heads"
          element={
            <FamilyHeadsView
              familyHeads={familyHeads}
              onAdd={handleOpenAddHead}
             
 onEdit={handleOpenEditHead}
              onView={(head) => {
                const family = families.find(
                  (f) => f.name === head.nombreFamilia
                );
                const member = family?.members.find((m) => m.id === head.id);
   
              if (member && family) {
                  handleOpenViewMember(member, family);
                }
              }}
              onArchive={handleArchiveHead}
              toggleSidebar={toggleSidebar}
            />
        
   }
        />
        
        <Route
          path="family-nucleus"
          element={
            <FamilyNucleusView
              families={families}
              onViewMember={handleOpenViewMember}
              onEdit={handleOpenEditHead}
              toggleSidebar={toggleSidebar}
            />
  
         }
        />
         {/* Ruta: /dashboard/archived */}
         <Route path="archived" element={<ArchivedView toggleSidebar={toggleSidebar}/>} />
        {/* Ruta: /dashboard/settings */}
        <Route path="settings" element={<SettingsView toggleSidebar={toggleSidebar} />} />
        {/* Ruta: /dashboard/upload-content */}
        <Route path="upload-content" element={<ImageUploadPage toggleSidebar={toggleSidebar} />} />
        {/* Ruta comodín si no 
 se encuentra la ruta interna */}
        <Route path="*" element={<DashboardView toggleSidebar={toggleSidebar} />} />
        <Route path="users" element={<Users />} />

      </Routes>
    );
 }; // -------------------------------------------------------------
  return (
    <div className="flex h-screen bg-gray-50 antialiased overflow-hidden">
     
      {/* Pasamos 'links', la vista activa, y los nuevos estados/funciones para el control del sidebar */}
     <Sidebar 
       links={links} 
       currentView={currentViewTitle} 
       isOpen={isSidebarOpen} 
       onClose={() => setIsSidebarOpen(false)} 
     />
      
      <main className="flex-grow overflow-y-auto relative">
         {/* Aquí renderizamos las rutas */}
        <ContentRouter />
      </main>

      <AddFamilyHeadModal
   
         isOpen={modalType === "addHead"}
        onClose={handleCloseModal}
        onSave={handleSaveHead}
      />

      <EditFamilyHeadModal
        isOpen={modalType === "editHead"}
        onClose={handleCloseModal}
        familyHead={selectedHead}
        onSave={handleSaveHead}
      />
      <MemberDetailModal
        isOpen={modalType === "viewMember"}
        onClose={handleCloseModal}
 
        member={selectedMember}
        family={selectedMemberFamily}
      />
    </div>
  );
 };

export default Dashboard;