import React, { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const FamilyHeadModal = ({ initialData, onSave, onClose }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    cedula: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    nombreFamilia: "",
    vivienda: "",
    fechaNacimiento: "",
    sexo: "Masculino",
    nacionalidad: "Venezolana",
    telefono: "",
    mercado: "",
    esManzanero: false,
    esJefeCalle: false,
    carnetCodigo: "",
    carnetSerial: "",
    notes: "",
    email: "",
    password: "",
  });

  const [perteneceATorre, setPerteneceATorre] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passValidation, setPassValidation] = useState({
    length: false,
    hasNumber: false,
    hasUpper: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
    ...initialData,
    // Corregimos posibles errores de nombres provenientes del modal
    mercado: initialData.mercado ?? 0,
    segundoNombre: initialData.segundoNombre || null,
    segundoApellido: initialData.segundoApellido || null,
    
    // IMPORTANTE: Convertir a booleano real, no string "false"
    esManzanero: initialData.esManzanero === true,
    esJefeCalle: initialData.esJefeCalle === true,

    // Asegurar que el password viaje con el nombre correcto (una 's' menos)
    password: initialData.password || null,
    
    // Formatear fecha si existe
    fechaNacimiento: initialData.fechaNacimiento 
      ? initialData.fechaNacimiento.split("T")[0] 
      : null,
      });
      if (initialData.vivienda?.toLowerCase().includes("torre"))
        setPerteneceATorre("si");
      else if (initialData.vivienda) setPerteneceATorre("no");
    }
  }, [initialData]);

  const validatePassword = (pass) => {
    setPassValidation({
      length: pass.length >= 8,
      hasNumber: /\d/.test(pass),
      hasUpper: /[A-Z]/.test(pass),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") validatePassword(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // CLAVE PARA EL ERROR: Limpiar datos si no es jefe de calle
    const dataToSend = { ...formData };

    if (dataToSend.esJefeCalle) {
      // Validar que realmente escribió algo
      if (!dataToSend.email || !dataToSend.password) {
        alert(
          "Por favor, ingrese el correo y la contraseña para el Jefe de Calle."
        );
        return;
      }
      // Validar seguridad
      if (
        !passValidation.length ||
        !passValidation.hasUpper ||
        !passValidation.hasNumber
      ) {
        alert("La contraseña no cumple los requisitos de seguridad.");
        return;
      }
    } else {
      // Si NO es jefe de calle, eliminamos estos campos para que el backend no de error
      delete dataToSend.email;
      delete dataToSend.password;
    }

    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {/* 1. Nacionalidad y Cédula */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-gray-700 mb-1">
            Nacionalidad *
          </label>
          <select
            name="nacionalidad"
            className="w-full border rounded-md p-2"
            value={formData.nacionalidad}
            onChange={handleChange}
          >
            <option value="Venezolana">Venezolana</option>
            <option value="Extranjera">Extranjera</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium text-gray-700 mb-1">
            Cédula *
          </label>
          <input
            type="text"
            name="cedula"
            className="w-full border rounded-md p-2"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* 2. Nombres y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="primerNombre"
          placeholder="Primer Nombre *"
          className="border rounded-md p-2"
          value={formData.primerNombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="segundoNombre"
          placeholder="Segundo Nombre"
          className="border rounded-md p-2"
          value={formData.segundoNombre}
          onChange={handleChange}
        />
        <input
          type="text"
          name="primerApellido"
          placeholder="Primer Apellido *"
          className="border rounded-md p-2"
          value={formData.primerApellido}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="segundoApellido"
          placeholder="Segundo Apellido"
          className="border rounded-md p-2"
          value={formData.segundoApellido}
          onChange={handleChange}
        />
      </div>

      {/* 3. Fecha de Nacimiento y Sexo */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="fechaNacimiento"
            className="w-full border rounded-md p-2"
            value={formData.fechaNacimiento}
            onChange={handleChange}
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium text-gray-700 mb-1">Sexo</label>
          <select
            name="sexo"
            className="w-full border rounded-md p-2"
            value={formData.sexo}
            onChange={handleChange}
          >
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>
      </div>

      {/* 4. Familia y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="nombreFamilia"
          placeholder="Nombre de la Familia *"
          className="border rounded-md p-2"
          value={formData.nombreFamilia}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          className="border rounded-md p-2"
          value={formData.telefono}
          onChange={handleChange}
        />
      </div>

      {/* 5. Vivienda */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <label className="block font-semibold text-gray-800 mb-3">
          ¿Pertenece a alguna torre? *
        </label>
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="vivienda_tipo"
              checked={perteneceATorre === "si"}
              onChange={() => setPerteneceATorre("si")}
            />{" "}
            Sí
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="vivienda_tipo"
              checked={perteneceATorre === "no"}
              onChange={() => setPerteneceATorre("no")}
            />{" "}
            No
          </label>
        </div>
        {perteneceATorre === "si" && (
          <select
            name="vivienda"
            className="w-full border rounded-md p-2"
            value={formData.vivienda}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione Torre...</option>
            {[...Array(13)].map((_, i) => (
              <option key={i} value={`Torre ${i + 1}`}>
                Torre {i + 1}
              </option>
            ))}
          </select>
        )}
        {perteneceATorre === "no" && (
          <input
            type="text"
            name="vivienda"
            placeholder="Ej: Calle 2, Casa 4"
            className="w-full border rounded-md p-2"
            value={formData.vivienda}
            onChange={handleChange}
            required
          />
        )}
      </div>

      {/* 6. Mercado */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Mercados asignados
        </label>
        <input
          type="text"
          name="mercado"
          className="w-full border rounded-md p-2"
          value={formData.mercado}
          onChange={handleChange}
        />
      </div>

      {/* 7. Roles Comunitarios */}
      <div className="flex flex-wrap gap-8 py-2 border-y border-gray-100">
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            ¿Es Manzanero?
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, esManzanero: true })}
              className={`px-4 py-1 rounded-md ${
                formData.esManzanero
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, esManzanero: false })}
              className={`px-4 py-1 rounded-md ${
                !formData.esManzanero
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-500"
              }`}
            >
              No
            </button>
          </div>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            ¿Es Jefe de Calle?
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, esJefeCalle: true })}
              className={`px-4 py-1 rounded-md ${
                formData.esJefeCalle
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  esJefeCalle: false,
                  email: "",
                  password: "",
                })
              }
              className={`px-4 py-1 rounded-md ${
                !formData.esJefeCalle
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-500"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* 8. Credenciales Jefe Calle */}
      {formData.esJefeCalle && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4 shadow-inner">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className="w-full border rounded-md p-2 bg-white"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              className="w-full border rounded-md p-2 pr-10 bg-white"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Validación visual de la contraseña */}
          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-tight">
            <span
              className={`flex items-center gap-1 ${
                passValidation.length ? "text-green-600" : "text-red-400"
              }`}
            >
              {passValidation.length ? (
                <CheckCircle size={12} />
              ) : (
                <XCircle size={12} />
              )}{" "}
              8+ Caracteres
            </span>
            <span
              className={`flex items-center gap-1 ${
                passValidation.hasUpper ? "text-green-600" : "text-red-400"
              }`}
            >
              {passValidation.hasUpper ? (
                <CheckCircle size={12} />
              ) : (
                <XCircle size={12} />
              )}{" "}
              Mayúscula
            </span>
            <span
              className={`flex items-center gap-1 ${
                passValidation.hasNumber ? "text-green-600" : "text-red-400"
              }`}
            >
              {passValidation.hasNumber ? (
                <CheckCircle size={12} />
              ) : (
                <XCircle size={12} />
              )}{" "}
              Número
            </span>
          </div>
        </div>
      )}

      {/* 9. Carnet de la Patria */}
      <div className="pt-2">
        <label className="inline-block font-bold text-gray-800 mb-3 border-b-2 border-blue-500">
          Carnet de la Patria
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            name="carnetCodigo"
            placeholder="Código"
            className="flex-1 border rounded-md p-2"
            value={formData.carnetCodigo}
            onChange={handleChange}
          />
          <input
            type="text"
            name="carnetSerial"
            placeholder="Serial"
            className="flex-1 border rounded-md p-2"
            value={formData.carnetSerial}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* 10. Observación Social */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Observación Social
        </label>
        <textarea
          name="notes"
          className="w-full border rounded-md p-2 min-h-[80px]"
          value={formData.notes}
          onChange={handleChange}
        ></textarea>
      </div>

      {/* Botones */}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          {isEdit ? "Guardar Cambios" : "Registrar Jefe"}
        </button>
      </div>
    </form>
  );
};

export default FamilyHeadModal;
