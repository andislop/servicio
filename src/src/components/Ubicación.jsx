import React from "react";
import Foto from "../assets/ubicacion.jpg";

const Ubicacion = () => {
  return (
    <section className="bg-light-gray-100" id="ubicacion">
      <div className="container mx-auto py-12">
        <div className="flex justify-center py-3">
          <div className="text-center w-full lg:w-1/2">
            <h1 className="text-3xl text-texto-h1">
              <b>Ubicación</b>
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="container mx-auto">
            <div className="flex flex-wrap p-5">
              <div className="w-full md:w-8/12 lg:w-6/12 lg:order-last mx-auto">
                <img
                  className="w-full h-auto"
                  src={Foto}
                  alt="Mapa de ubicación"
                />
              </div>
              <div className="w-full lg:w-6/12 my-auto flex items-center">
                <div className="text-left w-full">
                  <p className="text-justify">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ab
                    nostrum accusamus dolores quia ipsam dolorem molestiae
                    quidem est reprehenderit, delectus esse repellat dolore
                    pariatur sapiente, exercitationem explicabo quam provident
                    rem?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ubicacion;