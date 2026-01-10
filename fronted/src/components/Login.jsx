import React, { useState } from "react";
import Foto from "../assets/venezuela.png";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post(
        "http://localhost:3001/api/login",
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert(error.response?.data?.message || "Error de credenciales");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-gray-900 via-blue-400 to-gray-900 flex items-center justify-center">
      <Link
        to="/"
        className="fixed left-5 top-5 bg-sky-700/75 hover:bg-sky-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all hover:scale-110 z-50 shadow-md shadow-black"
      >
        <ArrowLeft size={18} /> 
        <span>Volver</span>
      </Link>

      <div className="flex flex-wrap items-center justify-center bg-bglogin rounded-2xl shadow-lg max-w-[800px] min-h-[480px]">
        {/* Lado Izquierdo */}
        <div className="flex flex-col items-center justify-center p-5 min-w-64 self-stretch border-none md:border-r md:p-2 md:border-solid md:border-[rgba(255,255,255,0.15)]">
          <img src={Foto} className="max-w-52 h-auto" alt="Logo UNEFA" />
          <p className="text-center text-base text-white">
            Bienvenido al área de administración.
          </p>
          <p className="font-bold text-center text-base text-white">
            Acceso solo para jefes de calle.
          </p>
        </div>

        {/* Lado Derecho */}
        <div className="flex flex-col p-5 items-center justify-center min-h-72 ml-9">
          <h2 className="font-bold text-3xl pb-4 text-white">Iniciar Sesión</h2>

          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center w-full"
          >
            <div className="mb-5 w-full max-w-72 relative">
              <label className="text-white text-sm block mb-1" htmlFor="correo">
                Correo
              </label>
              <input
                className="bg-transparent border-b border-white/40 py-2 text-white w-full focus:outline-none"
                id="correo"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-5 w-full max-w-72 relative">
              <label
                className="text-white text-sm block mb-1"
                htmlFor="contraseña"
              >
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  className="bg-transparent border-b border-white/40 py-2 pr-10 text-white w-full focus:outline-none transition-colors focus:border-white"
                  id="contraseña"
                  // Cambiamos dinámicamente el tipo de 'password' a 'text'
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Botón para alternar visibilidad */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-white/60 hover:text-white transition-colors p-1"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center w-full mt-4">
              <button
                type="submit" // 🚨 ESTO ES VITAL
                className="text-center block w-[280px] h-[40px] rounded-[20px] bg-gradient-to-r from-[#00aaff] via-[#007bff] to-[#00aaff] text-base text-white uppercase font-bold cursor-pointer transition-all hover:scale-105 shadow-lg active:scale-95"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
