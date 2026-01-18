import React, { useState } from "react";
import Foto from "../assets/venezuela.png";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import {toast} from "sonner";
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para feedback visual
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

 const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Creamos una notificación de carga (opcional pero muy pro)
    const toastId = toast.loading("Verificando credenciales...");

    try {
      const response = await Axios.post(
        "/api/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("¡Bienvenido de nuevo!", { id: toastId }); // Reemplaza el loading por éxito
        setTimeout(() => navigate("/dashboard"), 1500); // Pequeña pausa para que vean el mensaje
      }
    } catch (error) {
      const mensajeError = error.response?.data?.message || "Error de conexión con el servidor";
      toast.error(mensajeError, { id: toastId }); // Reemplaza el loading por error
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4">
      {/* Botón Volver con mejor estilo */}
      <Link
        to="/"
        className="fixed left-5 top-5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white py-2 px-4 rounded-full flex items-center gap-2 transition-all hover:-translate-x-1 border border-white/20 z-50 shadow-xl"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Volver</span>
      </Link>

      {/* Contenedor Principal con Glassmorphism */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* Lado Izquierdo: Branding */}
        <div className="flex-1 bg-gradient-to-b from-blue-600/20 to-transparent p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
            <img src={Foto} className="relative max-w-48 h-auto drop-shadow-2xl mb-8 transform hover:scale-105 transition-transform" alt="Logo" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Comunidad Villa Productiva III</h1>
          <p className="text-blue-200/70 text-sm leading-relaxed">
            Área de administración exclusiva para <br />
            <span className="text-blue-400 font-semibold italic">Jefes de Calle</span>
          </p>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-gray-400 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Correo */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-blue-400 font-bold ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-blue-400 font-bold ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botón de Ingreso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "ACCEDER AL PANEL"
              )}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;