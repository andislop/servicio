import React from "react";
import Venezuela from "../assets/venezuela.png";

const Images = {
  src: Venezuela,
};

function Conocenos() {
  return (
    <section className="bg-navbar-bg py-12" id="quienes-somos">
      <div className="container mx-auto">
        <div className="flex justify-center text-center pt-6">
          <div className="w-full lg:w-1/2 m-auto">
            <h1 className="text-sky-200 text-3xl py-6">
              <b>¿Quiénes Somos?</b>
            </h1>
            <p className="text-blanco text-justify">
              Somos la comunidad Villa Productiva III, un urbanismo consolidado
              gracias al esfuerzo colectivo y al apoyo de la Gran Misión
              Vivienda Venezuela desde el año 2016. Ubicados en la Parroquia
              Juan de Villegas de Barquisimeto, nuestro sector 'Torres' alberga
              a más de 3,200 habitantes distribuidos en 13 edificaciones que hoy
              representan el hogar de cientos de familias luchadoras. Nos
              definimos como una comunidad organizada que, bajo los principios
              de la democracia participativa, busca modernizar su gestión
              interna mediante la innovación tecnológica para garantizar el
              bienestar, la comunicación efectiva y el resguardo de la
              información de cada uno de nuestros residentes.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full md:w-4/12 p-12 mt-6">
            <img src={Venezuela} alt="" />
          </div>
          <div className="w-full md:w-4/12 p-12 mt-6">
            <img src={Venezuela} alt="" />{" "}
          </div>
          <div className="w-full md:w-4/12 p-12 mt-6">
            <img src={Venezuela} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Conocenos;