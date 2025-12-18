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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt
              similique aperiam dolorem saepe, molestiae sed iure culpa!
              Architecto dicta odit quis laborum! Quaerat, molestiae. Aliquam
              nihil itaque corrupti! Explicabo, eveniet. Commodi itaque deleniti
              deleniti doloribus, accusamus necessitatibus est ullam voluptate,
              quo eaque repellat autem eveniet nobis nam officiis, voluptas
              numquam consequatur veniam ab animi dolorem ad. Possimus ad atque
              maxime eum.
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