import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Archive,
  Menu,
} from "lucide-react"; // Importamos Menu
import StatusBadge from "./StatusBadge";

// Recibimos toggleSidebar
const FamilyNucleusView = ({
  nucleo,
  onAdd,
  onViewMember,
  onEdit,
  onEditMember,
  onArchive
}) => {
  const [expandedFamilyId, setExpandedFamilyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Nuevo estado para la página actual

  const ITEMS_PER_PAGE = 5; // Limite de 5 usuarios por página
  // Lógica de Paginación
  const totalPages = Math.ceil(nucleo.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  // Obtener solo los usuarios de la página actual
  const currentHeads = nucleo.slice(indexOfFirstItem, indexOfLastItem);

  // 💡 Truco: Resetear la página a 1 cuando los filtros cambian.
  useEffect(() => {
    setCurrentPage(1);
  }, [nucleo]);

  // Función para cambiar de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const toggleExpand = (familyId) => {
    setExpandedFamilyId(expandedFamilyId === familyId ? null : familyId);
  };

  const getAvatar = (member) => {
    if (member.avatar)
      return (
        <img
          src={member.avatar}
          alt={member.primer_nombre || "Usuario"}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-sm flex-shrink-0 min-w-[40px] sm:min-w-[48px]"
        />
      );

    const safeName = member?.primer_nombre || "U";
    const initials = safeName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shadow-sm flex-shrink-0 min-w-[40px] sm:min-w-[48px]">
        {initials}
      </div>
    );
  };

  // Renderizado de botones numéricos de paginación
  const renderPaginationButtons = () => {
    const pages = [];
    // Muestra hasta 5 botones numéricos centrados en la página actual
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          aria-current={i === currentPage ? "page" : undefined}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const firstItemDisplayed = nucleo.length > 0 ? indexOfFirstItem + 1 : 0;
  const lastItemDisplayed = Math.min(indexOfLastItem, nucleo.length);



  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Encabezado Principal (Responsive) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
        <div className="text-left">
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Núcleos Familiares
            </h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-lg mt-1 ml-8 sm:ml-0">
            Gestiona todos los miembros de cada familia
          </p>
        </div>
        <p className="text-gray-600 font-semibold text-base sm:text-lg bg-blue-100 px-3 py-1 rounded-full flex-shrink-0">
          {nucleo.length}{" "} familias registradas
        </p>
      </div>
      <p className="text-gray-500 mt-4 text-sm">
        Mostrando {firstItemDisplayed}-{lastItemDisplayed} de {nucleo.length}{" "}
        jefes de familia
      </p>
      {/* Lista de Familias (Acordeón) */}
      <div className="space-y-4">
        {currentHeads.map((family) => (
          <div
            key={family.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg"
          >
            {/* Header de la Familia (Responsive) */}
            <div
              className={`p-4 cursor-pointer flex justify-between items-center transition-all ${
                expandedFamilyId === family.id
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => toggleExpand(family.id)}
            >
              {/* Información de la Familia: Usa flex-wrap para apilar en móvil */}
              <div className="flex flex-wrap items-center space-x-0 sm:space-x-3 w-full sm:w-auto min-w-0">
                <div className="flex items-center w-full sm:w-auto mb-1 sm:mb-0">
                  <Home className="h-5 w-5 text-blue-600 inline-block mr-2 flex-shrink-0" />
                  {/* Aseguramos que el nombre no se desborde */}
                  <span className="text-lg font-semibold text-gray-900 truncate flex-grow min-w-0">
                    {family.nombre_familia}
                  </span>
                </div>
                {/* Detalles secundarios (miembros, dirección) */}
                <p className="text-xs sm:text-sm text-gray-500 w-full sm:w-auto pl-7 sm:pl-0">
                  <span className="hidden sm:inline-block">•</span>{" "}
                  {family.totalMiembros} miembros
                  <span className="block sm:inline-block sm:ml-2 truncate max-w-[200px] sm:max-w-full">
                    • {family.vivienda}
                  </span>
                </p>
              </div>

              {/* Indicador de Miembros y Expansión (A la derecha) */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <span className="text-blue-600 font-semibold text-sm sm:text-base hidden sm:inline-block">
                  {family.totalMiembros} miembros
                </span>
                <ChevronRight
                  className={`h-5 w-5 text-blue-600 transition-transform ${
                    expandedFamilyId === family.id ? "rotate-90" : "rotate-0"
                  }`}
                />
              </div>
            </div>

            {/* Detalle de Miembros (Expandido) */}
            {expandedFamilyId === family.id && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-md font-semibold text-gray-700">
                    Miembros de la familia
                  </h3>
                  <button
                    onClick={() => onAdd(family)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md shadow-blue-500/30 w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Miembro</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {family.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        {" "}
                        {/* min-w-0 aquí es clave */}
                        {getAvatar(member)}
                        {/* Detalles del Miembro (Responsive) */}
                        <div className="min-w-0 flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            {/* Nombre con truncate */}
                            <span className="font-medium text-gray-900 truncate text-base sm:text-lg">
                              {`${member.primer_nombre} ${member.primer_apellido}`}
                            </span>

                            {/* Roles y Status Badge (apilados en móvil, en línea en escritorio) */}
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                  member.rol === "Jefe de Familia"
                                    ? "bg-blue-100 text-blue-800"
                                    : member.rol === "Cónyuge"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {member.rol}
                              </span>
                              <StatusBadge status={member.status} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones de Miembro (Flex-shrink-0 para que no se compriman) */}
                      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0 ml-3">
                        <button
                          onClick={() => onViewMember(member, family)}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          aria-label="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            // 2. Lógica condicional: Si es Jefe usa la función de Jefe, si no, la de Miembro
                            if (member.rol === "Jefe de Familia") {
                              onEdit(member); // Tu función actual para editar el núcleo/jefe
                            } else {
                              onEditMember(member); // Nueva función para miembros
                            }
                          }}
                          className="text-gray-400 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onArchive(member)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Eliminar miembro"
                        >
                          <Archive className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
          {/* Botón Anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg transition-colors font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Botones de página */}
          <div className="flex space-x-2">{renderPaginationButtons()}</div>

          {/* Botón Siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg transition-colors font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default FamilyNucleusView;
