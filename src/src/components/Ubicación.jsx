import React from "react";
import Foto from "../assets/ubicacion.png";

const Ubicacion = () => {
  return (
    <section className="bg-light-gray-100" id="ubicacion">
      <div className="container mx-auto py-12 px-4">
        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-3xl text-texto-h1 font-bold">
            Ubicación
          </h1>
        </div>

        {/* Contenedor Flex con Gap para separación */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 p-2">
          
          {/* Imagen: lg:order-last para que en PC salga a la derecha */}
          <div className="w-full md:w-10/12 lg:w-5/12 lg:order-last">
            <img
              className="w-full h-auto rounded-lg shadow-sm"
              src={Foto}
              alt="Mapa de ubicación"
            />
          </div>

          {/* Texto */}
          <div className="w-full md:w-10/12 lg:w-5/12 text-center lg:text-left">
            <p className="text-base sm:text-lg text-justify lg:text-left leading-relaxed">
              La comunidad <b>“Villa Productiva III”</b> está ubicada en la
              Parroquia Juan de Villegas del Municipio Iribarren,
              Barquisimeto – Estado Lara, específicamente en el kilómetro
              8 de la Avenida Florencio Jiménez, vía Quíbor.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Ubicacion;