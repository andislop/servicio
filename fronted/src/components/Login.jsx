import React from "react";
import Foto from "../assets/venezuela.png";
import { Link } from "react-router-dom";

const links = [
  {
    id: 1,
    title: "Volver",
    link: "/",
  },
  {
    id: 2,
    title: "Ingresar",
    link: "/dashboard",
  },
];

const Login = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-gray-900 via-blue-400 to-gray-900 flex items-center justify-center">
      <Link
        to={links[0].link} // ✅ Usa el prop 'to' en lugar de 'href'
        className="fixed left-5 top-5 bg-sky-700/75 hover:bg-sky-700 theme-light text-gray-300 hover:text-gray-100  py-2 px-4 rounded transition-transform hover:scale-110 transform inline-block duration-300 shadow-md shadow-black"
      >
        {links[0].title}
      </Link>
      <div className="flex items-center space-x-4 text-white"></div>
      <div className="flex flex-wrap items-center justify-center bg-bglogin  rounded-2xl shadow-lg border-solid max-w-[800px] min-h-[480px]">
        <div className="flex flex-col items-center justify-center p-5 min-w-64 self-stretch border-none md:border-r md:p-2 md:border-solid md:border-[rgba(255,255,255,0.15)]">
          <img src={Foto} className="max-w-52 h-auto " alt="Logo UNEFA" />
          <p className="text-center text-base text-white">
            Bienvenido al área de administración de Villa Productiva.
          </p>
          <p className="font-bold text-center text-base text-white ">
            Esta área solo tiene acceso los jefes de calle.
          </p>
        </div>

        <div className="flex flex-col p-5 items-center justify-center min-h-72 ml-9">
          <h2 className="font-bold text-3xl pb-4">Iniciar Sesión</h2>
          <form
            id="loginForm"
            autoComplete="off"
            noValidate
            className="flex flex-col items-center"
          >
            <div className="mb-5 w-full max-w-72 relative label-floating">
              <label
                className="text-white text-base top-[10px] left-0 pointer-events-none transition-all duration-200 ease-in-out z-10 "
                htmlFor="correo"
              >
                Correo
              </label>
              <input
                className="bg-transparent  border-b border-b-[1px] border-solid border-[rgba(255,255,255,0.4)] py-2 px-0 text-white text-base w-full transition-all duration-200 ease-in-out shadow-none focus:outline-none justify-center pr-9"
                id="correo"
                type="email"
                required
                disable-selected
              />
            </div>

            <div className="form-group label-floating">
              <div className="relative w-full">
                <label
                  className="text-white text-base top-[10px] left-0 pointer-events-none transition-all duration-200 ease-in-out z-10 "
                  htmlFor="contraseña"
                >
                  Contraseña
                </label>
                <input
                  className="bg-transparent   border-b-[1px] border-solid border-[rgba(255,255,255,0.4)] py-2 px-0 text-white text-base w-full transition-all duration-200 ease-in-out shadow-none focus:outline-none justify-center pr-9"
                  id="contraseña"
                  type="password"
                  required
                />
                <span
                  className="absolute right-[10px] top-1/2 -translate-y-1/2 cursor-pointer text-white w-[20px] h-[20px] z-10 hover:opacity-[0.8]"
                  id="togglePassword"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
            <div className="flex justify-center w-full">
              <Link
                to={links[1].link}
                className="text-center  block w-full max-w-[280px] h-[40px] rounded-[20px] outline-none border-none bg-gradient-to-r from-[#00aaff] via-[#007bff] to-[#00aaff] bg-[length:200%] text-base text-white uppercase my-5 mx-0 cursor-pointer transition-all duration-500 shadow-[0_5px_15px_rgba(0,170,255,0.4)] px-0 py-0 hover:bg-right hover:-translate-y-[2px] hover:shadow-md hover:scale-110 "
              >
                Ingresar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
