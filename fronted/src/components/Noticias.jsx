// src/components/Noticias.jsx
import React, { useState, useEffect } from "react"; // Eliminamos useRef si no se usa
import NewCard from "./NewCard";

const Noticias = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

  // Lógica de Paginación
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);

  // CORRECCIÓN: Cálculo dinámico basado en el total de imágenes reales
  const totalItems = images.length;
  const firstItemDisplayed = totalItems > 0 ? indexOfFirstItem + 1 : 0;
  const lastItemDisplayed = Math.min(indexOfLastItem, totalItems);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/items/all`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar la galería.`);
      }
      const data = await response.json();
      const validImages = data.filter((item) => item && item.url);
      setImages(validImages);
    } catch (err) {
      console.error("Error al cargar noticias:", err);
      setError(`Error al cargar la información: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Opcional: Desplazar hacia arriba al cambiar de página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    startPage = Math.max(1, startPage);

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
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) return <div className="text-center mt-32 p-10 font-medium">Cargando noticias...</div>;
  if (error) return <div className="text-center mt-32 p-10 text-red-600 font-bold">❌ {error}</div>;
  if (images.length === 0) return <div className="text-center mt-32 p-10 text-gray-500">No hay noticias disponibles.</div>;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <section className="max-w-7xl mx-auto py-12 px-4 bg-gray-50 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Últimas Noticias
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Mantente al día con nuestras actualizaciones
            </p>
          </div>
          {/* Indicador de ítems mostrados */}
          <span className="text-sm text-gray-500 mt-4 md:mt-0 font-medium bg-white px-3 py-1 rounded-full border">
            Mostrando {firstItemDisplayed}-{lastItemDisplayed} de {totalItems}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-6">
          {currentItems.map((item) => (
            <NewCard key={item.id || item.url} news={item} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-10 border-t pt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-5 py-2 text-sm rounded-xl transition-all font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex space-x-2">{renderPaginationButtons()}</div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-5 py-2 text-sm rounded-xl transition-all font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Noticias;