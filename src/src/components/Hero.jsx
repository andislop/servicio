import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";



const Hero = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Parámetros de transformación (ejemplo: Cloudinary)
  const imageTransform = "w_1200,h_600,c_fill,g_auto,q_auto:best/";

  // ... (Tu función fetchImages se mantiene igual)

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      // ... (Lógica de fetch, filtrado y setImages)
      const response = await fetch(`/api/items1`);
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
      const latestImages = validImages.slice(0, 3);

      setImages(latestImages);
      if (latestImages.length > 0) {
        setActiveIndex(0);
      }
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

  // ... (handlePrev, handleNext, y estados de carga se mantienen iguales)
  const handlePrev = () => {
    if (images.length === 0) return;
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    if (images.length === 0) return;
    setActiveIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

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
    // Contenedor principal con altura fija para evitar colapso
    <div className="relative mt-32 overflow-hidden w-full h-[30rem] md:h-[31rem]">
      {/* CONTENEDOR DE SLIDES: Usando width: '100%' (tu corrección) */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          width: "100%",
        }}
      >
        {images.map((img) => {
          let finalSrc = img.url;

          if (finalSrc && finalSrc.includes("/upload/")) {
            const parts = finalSrc.split("/upload/");
            finalSrc = `${parts[0]}/upload/${imageTransform}${parts[1]}`;
          }

          const displayTitle = img.title || "Noticia sin Título";
          const displayDescription = img.description || "Sin descripción.";

          return (
            // SLIDE INDIVIDUAL: w-full es crucial
            <div
              key={img.id}
              // Eliminamos el style de ancho y usamos w-full flex-none para que ocupe todo el espacio visible
              className="w-full flex-none"
            >
              <div className="container mx-auto h-full px-4 md:px-8">
                {/* SECCIÓN DEL SLIDE (Texto + Imagen) */}
                <div className="flex flex-col md:flex-row p-5 gap-8 h-full">
                  {/* SECCIÓN DE TEXTO (w-full en móvil, w-1/2 en escritorio) */}
                  <div className="w-full md:w-1/2 flex items-center order-last md:order-first h-full">
                    {/* Agregamos pb-12 en móvil para separar el contenido de los puntos del slider */}
                    <div className="text-left self-center flex flex-col gap-4 pb-16 md:pb-0">
                      <h1 className="text-4xl font-bold text-texto-h1">
                        {displayTitle}
                      </h1>
                      <h3 className="text-2xl mt-2">
                        {displayDescription.split(".")[0] +
                          (displayDescription.includes(".") ? "." : "")}
                      </h3>

                      <div className="mt-4">
                        <Link
                          to="/"
                          className="inline-block bg-sky-700/75 hover:bg-sky-700 text-white py-2 px-6 rounded-lg transition-all hover:scale-105 shadow-md shadow-black/20"
                        >
                          Ver más noticias
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* SECCIÓN DE IMAGEN (w-full en móvil, w-1/2 en escritorio) */}
                  <div className="w-full md:w-1/2 order-first md:order-last mx-auto">
                    <img
                      // 🚨 CAMBIO CLAVE: Altura más pequeña en móvil (h-64) y altura mayor en escritorio (md:h-96)
                      className="w-full h-64 md:h-96 object-cover rounded-lg shadow-xl"
                      src={finalSrc}
                      alt={displayTitle}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ... (Indicadores y Controles de navegación se mantienen iguales) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 ">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              className={`w-3 h-3 rounded-full ${
                activeIndex === index ? "bg-black" : "bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Diapositiva anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 px-3 py-2 space-x-8 bg-gray-800 text-white rounded-r-full opacity-50 hover:opacity-100 transition-transform hover:scale-110 transform inline-block "
          >
            &lsaquo;
          </button>
          <button
            onClick={handleNext}
            aria-label="Diapositiva siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 text-white rounded-l-full opacity-50 hover:opacity-100 transition-transform hover:scale-110 transform inline-block "
          >
            &rsaquo;
          </button>
        </>
      )}
    </div>
  );
};

export default Hero;
