// src/components/Noticias.jsx
import React, { useRef, useState, useEffect } from "react";
import NewCard from "./NewCard"; // Importamos el componente que acabamos de crear

const Noticias = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Nuevo estado para la página actual

  const ITEMS_PER_PAGE = 4; // Limite de 5 usuarios por página

  // Lógica de Paginación
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);

  // 💡 Truco: Resetear la página a 1 cuando los filtros cambian.
  useEffect(() => {
    setCurrentPage(1);
  }, []);

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
          aria-current={i === currentPage ? "page" : undefined}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const firstItemDisplayed = 25 > 0 ? indexOfFirstItem + 1 : 0;
  const lastItemDisplayed = Math.min(indexOfLastItem, 25);

  // Datos de ejemplo (luego podrías traerlos de una API)
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      // ... (Lógica de fetch, filtrado y setImages)
      const response = await fetch(`http://localhost:3001/api/items/all`);
      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Error de conexión." }));
        throw new Error(
          errorBody.message ||
            `Error ${response.status}: No se pudo cargar la galería.`
        );
      }
      const data = await response.json();

      const validImages = data.filter((item) => item && item.url);

      setImages(validImages);
    } catch (err) {
      console.error("Error al cargar ítems para el carrusel:", err);
      setError(`Error al cargar la información: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

    if (loading) {
    return <div className="text-center mt-32 p-10">Cargando noticias...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-32 p-10 text-red-600">❌ {error}</div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center mt-32 p-10">
        No hay noticias o imágenes disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <section className="max-w-7xl mx-auto py-12 px-4 bg-gray-50">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Últimas Noticias
            </h2>
            <p className="text-gray-500 mt-2">
              Mantente al día con nuestras actualizaciones
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-6">
          {currentItems.map((item) => (
            <NewCard key={item.id} news={item} />
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
      </section>
    </div>
  );
};

export default Noticias;
