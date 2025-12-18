// src/components/Loading/Loading.jsx

import React from 'react';
import VenezuelaFlag from '../assets/venezuela.png'; // Tu imagen PNG de la bandera a color

const Loading = () => {
  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-gray-900 flex-col">
      {/* Contenedor principal de la bandera */}
      <div className="relative w-[150px] h-[100px] overflow-hidden rounded-lg shadow-xl">
        {/*
          La imagen de la bandera. Le aplicamos la animación 'colorize-flag'.
          Empieza en blanco y negro/oscuro y termina a color/normal.
        */}
        <img
          src={VenezuelaFlag}
          alt="Bandera de Venezuela"
          className="w-full h-full object-cover animate-colorize-flag"
        />

        {/*
          OPCIONAL: Si quieres un efecto de "ola" que sube *sobre* la imagen que se colorea,
          podríamos añadir un div aquí que suba y revele el color.
          Pero el método de filter ya da un buen resultado.

          Si quieres un efecto de "barrido" (como la ola de antes, pero en lugar de colores sólidos
          que aparezca la imagen coloreada), sería más complejo y quizás requiera un pseudo-elemento
          o un elemento extra con un degradado de transparencia animado.
        */}
      </div>
      <p className="mt-4 text-white text-lg font-semibold">Cargando...</p>
    </div>
  );
};

export default Loading;