import React, { useState } from "react";
import Logo from "../assets/venezuela.png";
import { Link } from "react-router-dom"; // Importa el componente Link

// Links de navegacion (asegúrate de que los links tengan el ID correcto)
const navbarlinks = [
  { id: 1, title: "Inicio", link: "/" },
  { id: 2, title: "¿Quiénes Somos?", link: "#quienes-somos" },
  { id: 3, title: "Ubicación", link: "#ubicacion" },
  { id: 4, title: "Noticias", link: "/noticias" },
];

const navbarlogin = [
  { id: 1, title: "Iniciar Sesion", link: "/login" },
];

const navbarmovil = [
  { id: 1, title: "Inicio", link: "/" },
  { id: 2, title: "¿Quiénes Somos?", link: "#quienes-somos" },
  { id: 3, title: "Ubicación", link: "#ubicacion" },
  { id: 4, title: "Noticias", link: "/noticias" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  //Para el menú de hamburguesa
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  //Función para el manejo de los links
  const handleScroll = (e) => {
    e.preventDefault();
    const targetHref = e.currentTarget.getAttribute("href");
    const targetElement =
      targetHref === "#"
        ? null
        : document.getElementById(targetHref.substring(1));

    let targetPosition;
    const navbarHeight = document.querySelector("nav").offsetHeight;

    if (targetElement) {
      targetPosition = targetElement.offsetTop - navbarHeight;
    } else {
      targetPosition = 0; // Para el enlace de inicio
    }

    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 500; // Milisegundos para la animación
    let startTime = null;

    function animateScroll(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * easeInOutCubic);

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    }
    requestAnimationFrame(animateScroll);
    setIsOpen(false); // Cierra el menú móvil al hacer click
  };

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg w-full border-b border-opacity-10 border-white bg-navbar-bg hadow-black shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 sm:py-6 px-4">
        <div className="flex flex-col items-center  md:flex-row md:items-center">
          <img
            src={Logo}
            alt="Logo de Comunidad Villa Productiva"
            className="w-[45px] sm:w-[60px] flex-shrink-0"
          />
          <span className="ml-2 text-l font-semibold whitespace-nowrap hidden md:block text-white">
            Comunidad Villa Productiva III
          </span>
          <span className="text-[12px] sm:text-sm font-semibold block md:hidden mt-1 text-white text-center leading-tight">
            Comunidad Villa Productiva III
          </span>
        </div>

        {/* Menu de navegacion */}
        <div
          className="hidden md:flex flex-1 justify-center text-blanco"
          id="menu"
        >
          <ul className="flex space-x-8">
            {navbarlinks.map((link) => {
              const isAnchor = link.link.startsWith("#");

              return (
                <li key={link.id}>
                  {isAnchor ? (
                    <a
                      className="hover:font-bold hover:text-md hover:text-sky-400 theme-light transition-transform hover:scale-110 transform inline-block duration-300 relative group text-white"
                      href={link.link}
                      onClick={handleScroll}
                    >
                      {link.title}
                      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  ) : (
                    <Link
                      className="hover:font-bold hover:text-md hover:text-sky-400 theme-light transition-transform hover:scale-110 transform inline-block duration-300 relative group text-white"
                      to={link.link}
                    >
                      {link.title}
                      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Botón de inicio de sesión*/}
        <div className="flex items-center space-x-2 sm:space-x-4 text-white flex-shrink-0">
          <Link
            to={navbarlogin[0].link}
            className="hidden sm:block bg-sky-700/75 hover:bg-sky-700 text-[12px] sm:text-base py-1.5 px-3 sm:py-2 sm:px-4 rounded transition-transform hover:scale-105 duration-300 shadow-md shadow-black whitespace-nowrap"
          >
            {navbarlogin[0].title}
          </Link>

          {/* Menu de Hamburguesa para móvil */}
          <button onClick={toggleMenu} className="md:hidden text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navegación para móvil*/}
      <div
        className={`md:hidden absolute text-white w-full bg-navbar-bg duration-300 transition-all ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible h-0"
        } border-t border-white border-opacity-30`}
      >
        <ul className="flex flex-col items-center py-4">
          {navbarmovil.map((link) => (
            <li key={link.id} className="py-2">
              <a
                className=" hover:text-sky-400"
                href={link.link}
                onClick={handleScroll}
              >
                {link.title}
              </a>
            </li>
          ))}
          {/* Botón agregado al menú hamburguesa */}
          <li className="py-4 w-full px-10">
            <Link
              to={navbarlogin[0].link}
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-sky-700/75 py-2 rounded text-sm font-semibold"
            >
              {navbarlogin[0].title}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;