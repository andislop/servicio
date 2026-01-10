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
import Users from "./Usuarios";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import Manzaneros from "./Manzaneros";
import AddMemberModal from "./AddMemberModal";

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
    title: "Manzaneros",
    link: "manzaneros",
  },
  {
    id: 5,
    title: "Usuarios en el Sistema",
    link: "users",
  },
  {
    id: 6,
    title: "Configuración",
    link: "settings",
  },
  {
    id: 7,
    title: "Agregar Contenido",
    link: "upload-content",
  },
  {
    id: 8,
    title: "María .i.",
    link: "profile",
  },
  {
    id: 9,
    title: "Archivados",
    link: "archived",
  },
];
const API_BASE_URL = "http://localhost:3001/api/jefes";

const Dashboard = () => {
  const [families, setFamilies] = useState([]);
  const [nucleo, setNucleo] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [manzaneros, setManzaneros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState([]);
  const [datoPersonas, setDatoPersonas] = useState([]);
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [datosGrafica2, setDatosGrafica2] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedHead, setSelectedHead] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberFamily, setSelectedMemberFamily] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);

  // Función para alternar el estado del Sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const fetchFamiliesAndHeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get("http://localhost:3001/api/jefes", {
        withCredentials: true,
      });
      const jefesFromApi = response.data;
      const transformedFamilies = jefesFromApi.map((jefe) => {
        const isHead = true;
        const memberStatus = jefe.estado || "Activo";
        const familyId = jefe.id_persona || jefe.id;

        return {
          id: familyId,
          activeMembers: memberStatus === "Activo" ? 1 : 0,
          registeredDate:
            jefe.registeredDate || new Date().toISOString().split("T")[0],
          members: [
            {
              id: jefe.id,
              primerNombre: jefe.primer_nombre ?? "",
              primerApellido: jefe.primer_apellido ?? "",
              vivienda: jefe.vivienda ?? "",
              rol: jefe.rol ?? "",
              total: jefe.totalJefes ?? "",
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get("http://localhost:3001/api/usuarios");
      const usuariosFromApi = response.data;

      const transformedUsers = usuariosFromApi.map((user) => {
        // Generamos las iniciales para el avatar
        const initials = (user.primer_nombre || "U")
          .split(" ")
          .map((n) => n[0])
          .join("");

        return {
          id: user.id_persona,
          email: user.email,
          name: user.primer_nombre || "Usuario sin nombre",
          role: user.rol || "No asignado",
          vivienda: user.vivienda || "N/A",
          // Estructura compatible con tus otros componentes
          avatar: `https://placehold.co/100x100/3b82f6/ffffff?text=${initials}`,
          raw: user, // Guardamos el objeto original por si acaso
        };
      });

      setUsuarios(transformedUsers);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManzaneros = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get("http://localhost:3001/api/manzaneros");
      const manzanerosFromApi = response.data;

      const datosManzanero = manzanerosFromApi.map((user) => {
        // Generamos las iniciales para el avatar
        const initials = (user.primer_nombre || "U")
          .split(" ")
          .map((n) => n[0])
          .join("");

        return {
          id: user.id_persona,
          vivienda: user.vivienda,
          name: user.primer_nombre || "Usuario sin nombre",
          apellido: user.primer_apellido || "Usuario sin nombre",
          role: user.rol || "No asignado",
          totalMiembros: user.totalMiembrosVivienda || "N/A",
          // Estructura compatible con tus otros componentes
          avatar: `https://placehold.co/100x100/3b82f6/ffffff?text=${initials}`,
          raw: user, // Guardamos el objeto original por si acaso
        };
      });

      setManzaneros(datosManzanero);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setManzaneros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFamilies = useCallback(async () => {
    try {
      const response = await Axios.get("http://localhost:3001/api/nucleos", {
        withCredentials: true,
      });
      // Tu API ya devuelve los datos agrupados, NO necesitas el .reduce
      const dataAgrupada = response.data.map((familia) => ({
        ...familia,
        // Opcional: Si quieres agregar los avatares aquí
        members: familia.members.map((m) => {
          const initials =
            `${m.primer_nombre?.[0] || ""}${
              m.primer_apellido?.[0] || ""
            }`.toUpperCase() || "U";
          return {
            ...m,
            avatar: `https://placehold.co/100x100/3b82f6/ffffff?text=${initials}`,
          };
        }),
      }));

      setNucleo(dataAgrupada);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setNucleo([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNombre = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get("http://localhost:3001/api/me", {
        withCredentials: true,
      });
      const usuario = response.data.user;
      const initials = (usuario.primer_nombre?.[0] || "U")
        .split(" ")
        .map((n) => n[0])
        .join("");

      const datoProcesado = {
        nombreCompleto: `${usuario.primer_nombre}`,
        rol: `${usuario.rol}`,
        avatar: `https://placehold.co/100x100/3b82f6/ffffff?text=${initials}`,
      };
      setNombreUsuario(datoProcesado);
    } catch (error) {
      console.error("Error al cargar daatos", error);
      setNombreUsuario([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDatoPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get(
        "http://localhost:3001/api/datos-personas",
        { withCredentials: true }
      );
      const nombreFromApi = response.data;
      const datos = nombreFromApi.map((nombre) => {
        return {
          total: nombre.total_miembros,
          promedio: nombre.promedio,
        };
      });
      setDatoPersonas(datos);
    } catch (error) {
      console.error("Error al cargar daatos", error);
      setDatoPersonas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDatosGrafica = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get(
        "http://localhost:3001/api/datos-grafica"
      );
      const nombreFromApi = response.data;
      const datos = nombreFromApi.map((nombre) => {
        return {
          torre: nombre.torre,
          total: nombre.total_habitantes,
        };
      });
      setDatosGrafica(datos);
    } catch (error) {
      console.error("Error al cargar daatos", error);
      setDatosGrafica([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDatosGrafica2 = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Axios.get(
        "http://localhost:3001/api/datos-grafica-2"
      );
      const nombreFromApi = response.data;
      const datos = nombreFromApi.map((nombre) => {
        return {
          rango: nombre.rango_edad,
          porcentaje: nombre.porcentaje,
        };
      });
      setDatosGrafica2(datos);
    } catch (error) {
      console.error("Error al cargar daatos", error);
      setDatosGrafica2([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamiliesAndHeads();
  }, [fetchFamiliesAndHeads]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchManzaneros();
  }, [fetchManzaneros]);

  useEffect(() => {
    fetchNombre();
  }, [fetchNombre]);

  useEffect(() => {
    fetchDatoPersonas();
  }, [fetchDatoPersonas]);

  useEffect(() => {
    fetchDatosGrafica();
  }, [fetchDatosGrafica]);

  useEffect(() => {
    fetchDatosGrafica2();
  }, [fetchDatosGrafica2]);

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
  const handleOpenEditHead = useCallback(async (member) => {
    const id = member.id_persona || member.id;

    if (!id) {
      console.error("Miembro sin id_persona:", member);
      alert("Error interno: miembro sin identificador.");
      return;
    }
    try {
      const { data } = await Axios.get(
        `http://localhost:3001/api/personas/${id}`
      );

      setSelectedHead(data); // 👉 ahora tienes TODOS los datos
      setModalType("editHead");
    } catch (error) {
      console.error("Error cargando datos para edición:", error);
      alert("No se pudo cargar la información del jefe.");
    }
  }, []);

  const handleOpenViewMember = useCallback(async (member) => {
    const id = member.id_persona || member.id;

    if (!id) {
      console.error("Miembro sin id_persona:", member);
      alert("Error interno: miembro sin identificador.");
      return;
    }

    try {
      const { data } = await Axios.get(
        `http://localhost:3001/api/personas/${id}`
      );

      setSelectedMember(data);
      setSelectedMemberFamily({
        nombre_familia: data.nombre_familia,
        vivienda: data.vivienda,
        membersCount: data.totalMiembros,
      });

      setModalType("viewMember");
    } catch (error) {
      console.error("Error cargando ficha:", error);
      alert("No se pudo cargar la ficha del habitante.");
    }
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
      ...familyHeadData,
      segundoNombre: familyHeadData.segundoNombre || null,
      segundoApellido: familyHeadData.segundoApellido || null,
      esManzanero: familyHeadData.esManzanero === true,
      esJefeCalle: familyHeadData.esJefeCalle === true,
      password: familyHeadData.password || null,
      fechaNacimiento: familyHeadData.fechaNacimiento
        ? familyHeadData.fechaNacimiento.split("T")[0]
        : null,
    };

    try {
      if (isNew) {
        try {
          const response = await Axios.post(
            "http://localhost:3001/api/registrar-jefe",
            dataToSend,
            { withCredentials: true }
          );

          if (response.status === 202) {
            alert(
              "Solicitud enviada: Esperando aprobación de la administradora."
            );
          } else {
            alert("Jefe de familia registrado con éxito!");
          }
        } catch (error) {
          console.error(error.response?.data?.message); // Esto te dirá el error exacto de SQL
        }
      } else {
        await Axios.put(
          `http://localhost:3001/api/editar-jefe/${familyHeadData.id}`,
          dataToSend
        );
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

  const handleOpenAddMember = (family) => {
    setSelectedFamily(family);
    setModalType("addMember");
  };
  const handleEditMember = useCallback(async (member) => {
    const id = member.id_persona || member.id;
    if (!id) return;

    try {
      // 🔍 Buscamos los datos completos (cédula, carnet, etc.)
      const { data } = await Axios.get(
        `http://localhost:3001/api/personas/${id}`
      );

      setSelectedMember(data); // Ahora sí tiene cedula, codigo_carnet, etc.
      setModalType("editMember");
    } catch (error) {
      console.error("Error cargando datos del miembro:", error);
      alert("No se pudo obtener la información completa.");
    }
  }, []);

  const handleSaveMember = async (newMemberData) => {
    const idReal = selectedFamily?.id_nucleo || selectedFamily?.id;

    const dataToBackend = {
      idNucleo: idReal,
      cedula: newMemberData.cedula,
      primerNombre: newMemberData.primerNombre,
      primerApellido: newMemberData.primerApellido,
      segundoNombre: newMemberData.segundoNombre || null,
      segundoApellido: newMemberData.segundoApellido || null,
      fechaNacimiento: newMemberData.fechaNacimiento,
      sexo: newMemberData.sexo,
      telefono: newMemberData.telefono || null,
      nacionalidad: newMemberData.nacionalidad,
      carnetCodigo: newMemberData.carnetCodigo || null,
      carnetSerial: newMemberData.carnetSerial || null,
    };

    try {
      if (modalType === "editMember") {
        // 📝 MODO EDICIÓN
        await Axios.put(
          `http://localhost:3001/api/editar-miembro/${newMemberData.id_persona}`,
          dataToBackend
        );
        alert("¡Miembro actualizado con éxito!");
      } else {
        // ➕ MODO AGREGAR
        await Axios.post(
          "http://localhost:3001/api/agregar-miembro",
          dataToBackend
        );
        alert("¡Miembro agregado con éxito!");
      }

      setModalType(null);
      fetchFamilies();
    } catch (error) {
      console.error("Error al procesar:", error.response?.data);
      alert("Error: " + (error.response?.data?.message || "Revisa la consola"));
    }
  };

  const handleUpdateMember = async (updatedData) => {
    const idPersona = selectedMember.id_persona || selectedMember.id;

    const dataToBackend = {
      cedula: updatedData.cedula,
      primerNombre: updatedData.primerNombre,
      primerApellido: updatedData.primerApellido,
      segundoNombre: updatedData.segundoNombre,
      segundoApellido: updatedData.segundoApellido,
      fechaNacimiento: updatedData.fechaNacimiento,
      sexo: updatedData.sexo,
      telefono: updatedData.telefono,
      nacionalidad: updatedData.nacionalidad,
      carnetCodigo: updatedData.carnetCodigo, // Asegúrate de que coincida con tu Modal
      carnetSerial: updatedData.carnetSerial,
    };

    try {
      await Axios.put(
        `http://localhost:3001/api/editar-miembro/${idPersona}`,
        dataToBackend
      );
      alert("Datos actualizados");
      setModalType(null);
      fetchFamilies(); // Recargar la lista
    } catch (error) {
      console.error("Error al editar:", error.response?.data);
    }
  };
  const handleArchiveHead = async (head) => {
    const apiData = {
      nombre: head.name ?? head.nombre ?? "",
      fechaNacimiento: head.dob ?? head.fechaNacimiento ?? null,
      ocupacion: head.occupation ?? head.ocupacion ?? null,
      email: head.email ?? null,
      telefono: head.phone ?? head.telefono ?? null,
      estado: "Inactivo",
      nombreFamilia: head.nombreFamilia ?? head.familyName ?? "",
      direccion: head.address ?? head.direccion ?? null,
      notas: head.notes ?? head.notas ?? null,
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
    const currentPathSegment = location.pathname.split("/dashboard")[1] || "/";

    // Eliminamos la barra inicial si existe, para comparar con 'family-heads'
    const cleanPath = currentPathSegment.startsWith("/")
      ? currentPathSegment.substring(1)
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
        <Route
          path="/"
          element={
            <DashboardView
              toggleSidebar={toggleSidebar}
              familyHeads={familyHeads}
              nucleo={nucleo}
              datoPersonas={datoPersonas}
              datosGrafica={datosGrafica}
              datosGrafica2={datosGrafica2}
            />
          }
        />
        <Route
          path="family-heads"
          element={
            <FamilyHeadsView
              familyHeads={familyHeads}
              onAdd={handleOpenAddHead}
              onEdit={handleOpenEditHead}
              onView={(head) => handleOpenViewMember({ id: head.id })}
              onArchive={handleArchiveHead}
              toggleSidebar={toggleSidebar}
            />
          }
        />

        <Route
          path="family-nucleus"
          element={
            <FamilyNucleusView
              nucleo={nucleo}
              onAdd={handleOpenAddMember}
              onViewMember={handleOpenViewMember}
              onEdit={handleOpenEditHead}
              onEditMember={handleEditMember}
              toggleSidebar={toggleSidebar}
            />
          }
        />

        <Route
          path="manzaneros"
          element={
            <Manzaneros
              manzaneros={manzaneros}
              onAdd={handleOpenAddHead}
              onViewMember={handleOpenViewMember}
              onEdit={handleOpenEditHead}
              toggleSidebar={toggleSidebar}
            />
          }
        />

        {/* Ruta: /dashboard/archived */}
        <Route
          path="archived"
          element={<ArchivedView toggleSidebar={toggleSidebar} />}
        />
        {/* Ruta: /dashboard/settings */}
        <Route
          path="settings"
          element={<SettingsView toggleSidebar={toggleSidebar} />}
        />
        {/* Ruta: /dashboard/upload-content */}
        <Route
          path="upload-content"
          element={<ImageUploadPage toggleSidebar={toggleSidebar} />}
        />
        {/* Ruta comodín si no 
 se encuentra la ruta interna */}
        <Route
          path="*"
          element={<DashboardView toggleSidebar={toggleSidebar} />}
        />
        <Route
          path="users"
          element={
            <Users
              usuarios={usuarios}
              onAdd={handleOpenAddHead}
              onViewMember={handleOpenViewMember}
              onEdit={handleOpenEditHead}
              toggleSidebar={toggleSidebar}
            />
          }
        />
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
        userRole={nombreUsuario?.rol}
      />

      <main className="flex-grow overflow-y-auto relative">
        {/* INSERTAMOS EL NAVBAR AQUÍ */}
        <NavBar
          nombreUsuario={nombreUsuario}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Contenedor del contenido con scroll independiente */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8">
          <ContentRouter />
        </div>
      </main>

      <AddFamilyHeadModal
        isOpen={modalType === "addHead"}
        onClose={handleCloseModal}
        onSave={handleSaveHead}
      />
      {modalType === "addMember" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddMemberModal
              familyId={selectedFamily?.id_familia}
              familyName={selectedFamily?.nombre_familia}
              onSave={handleSaveMember}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}

      <EditFamilyHeadModal
        isOpen={modalType === "editHead"}
        onClose={handleCloseModal}
        familyHead={selectedHead}
        onSave={handleSaveHead}
      />

      {modalType === "editMember" && (
        <AddMemberModal
          initialData={selectedMember}
          isEditing={true}
          onSave={handleUpdateMember} // La función API que creamos antes
          onClose={() => {
            setModalType(null);
            setSelectedMember(null);
          }}
        />
      )}
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
