import React, { useState, useMemo, useEffect } from 'react'
import {
  Home, Users, Archive, Settings, LayoutDashboard, Plus, Download, Edit, Trash2, Eye, MapPin, Calendar, Mail, Phone, Clock, User, ChevronRight, FileText, Menu, MoreVertical
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';


const FamilyHeadsView = ({ familyHeads, onAdd, onEdit, onView, onArchive, toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1); // Nuevo estado para la página actual
  
  const ITEMS_PER_PAGE = 5; // Limite de 5 usuarios por página

  const filteredHeads = useMemo(() => {
    return familyHeads
      .filter(head => {
        const matchesSearch = head.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          head.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          head.nombreFamilia.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'Todos' || head.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
  }, [familyHeads, searchTerm, filterStatus]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredHeads.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  // Obtener solo los usuarios de la página actual
  const currentHeads = filteredHeads.slice(indexOfFirstItem, indexOfLastItem);
  
  // 💡 Truco: Resetear la página a 1 cuando los filtros cambian.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Función para cambiar de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    return pages;
  };
  
  const firstItemDisplayed = filteredHeads.length > 0 ? indexOfFirstItem + 1 : 0;
  const lastItemDisplayed = Math.min(indexOfLastItem, filteredHeads.length);


  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* SECCIÓN DE ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden text-gray-600 hover:text-blue-600 mr-2 p-1 rounded-md transition duration-150"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Gestión de Jefes de Familia</h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-lg mt-1">Administra los jefes de cada núcleo familiar</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm w-full sm:w-auto">
            <Download className="h-5 w-5" />
            <span>Exportar</span>
          </button>
          <button onClick={onAdd} className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50 w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            <span>Agregar Jefe de Familia</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Buscar por nombre, email o familia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lg:flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div className="flex space-x-3 w-full lg:w-auto lg:space-x-4">
            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="Todos">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
            </select>
            <button
                onClick={() => { setSearchTerm(''); setFilterStatus('Todos'); setCurrentPage(1); }} // Resetear página también
                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex-shrink-0"
            >
                Limpiar
            </button>
        </div>
      </div>

      <p className="text-gray-500 mt-4 text-sm">
        Mostrando {firstItemDisplayed}-{lastItemDisplayed} de {filteredHeads.length} jefes de familia
      </p>

      {/* LISTA DE JEFES DE FAMILIA - Usamos currentHeads */}
      <div className="space-y-4">
        {currentHeads.map(head => (
          <div key={head.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-shadow hover:shadow-lg">
            
            {/* Información del Jefe de Familia */}
            <div className="flex items-start space-x-4 mb-3 sm:mb-0 sm:flex-grow min-w-0"> 
              {/* Avatar */}
              <img 
                src={head.avatar || 'https://placehold.co/100x100/3b82f6/ffffff?text=RG'} 
                alt={head.name} 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-sm flex-shrink-0" 
              />
              
              {/* Detalles del Texto */}
              <div className="min-w-0 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-0.5">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-full">
                    {head.name}
                  </span>
                  <div className="flex space-x-2 mt-1 sm:mt-0 flex-shrink-0">
                    <StatusBadge status={head.status} />
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                      Jefe de Familia
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{head.email}</p>
                <p className="text-xs text-gray-400 truncate">
                  <MapPin className="h-3 w-3 inline-block mr-1 text-red-400" /> 
                  {head.nombreFamilia} • {head.occupation}
                </p>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="flex space-x-2 sm:space-x-3 justify-end sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 mt-3 sm:mt-0 w-full sm:w-auto flex-shrink-0">
              <ActionButton icon={Eye} label="Ver" onClick={() => onView(head)} color="blue" small />
              <ActionButton icon={Edit} label="Editar" onClick={() => onEdit(head)} color="green" small />
              <ActionButton icon={Archive} label="Archivar" onClick={() => onArchive(head)} color="red" small />
            </div>
          </div>
        ))}
        {currentHeads.length === 0 && filteredHeads.length > 0 && (
            <p className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-md">No hay jefes de familia en esta página. Intente ir a la página 1.</p>
        )}
        {filteredHeads.length === 0 && (
          <p className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-md">No se encontraron jefes de familia que coincidan con la búsqueda.</p>
        )}
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
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
            <div className="flex space-x-2">
                {renderPaginationButtons()}
            </div>
            
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

export default FamilyHeadsView;