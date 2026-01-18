import React, { useEffect, useState, useRef } from "react";
import { Eye, EyeOff, Save, User, Home, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const SettingsView = ({ onClose }) => {
  const fetchedRef = useRef(false); // 🔴 evita múltiples llamadas

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tipoVivienda, setTipoVivienda] = useState(null); // "torre" | "casa"

  const [formData, setFormData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    cedula: "",
    nacionalidad: "Venezolana",
    nombre_familia: "",
    vivienda: "",
    email: "",
    telefono: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  /* =============================
     CARGA ÚNICA DE DATOS
  ============================== */
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "/api/profile-settings",
          { withCredentials: true },
        );

        if (res.data) {
          setFormData((prev) => ({ ...prev, ...res.data }));

          if (res.data.vivienda) {
            const viv = res.data.vivienda.toLowerCase();
            setTipoVivienda(viv.includes("torre") ? "torre" : "casa");
          }
        }
      } catch (err) {
        console.error("error", err);
        toast.error("Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* =============================
     HANDLERS
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(
        "/api/update-profile-secure",
        formData,
        { withCredentials: true },
      );
      toast.success("Perfil actualizado");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  /* =============================
     LOADING
  ============================== */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto p-4">
      {/* =============================
          INFORMACIÓN PERSONAL
      ============================== */}
      <Section
        title="Información Personal"
        icon={<User size={20} />}
        color="blue"
      >
        <Grid>
          <Select
            label="Nacionalidad"
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            options={["Venezolana", "Extranjera"]}
          />
          <Field
            label="Cédula"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
          />
          <Field
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
          <Field
            label="Primer Nombre"
            name="primer_nombre"
            value={formData.primer_nombre}
            onChange={handleChange}
          />
          <Field
            label="Segundo Nombre"
            name="segundo_nombre"
            value={formData.segundo_nombre}
            onChange={handleChange}
          />
          <Field
            label="Primer Apellido"
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
          />
          <Field
            label="Segundo Apellido"
            name="segundo_apellido"
            value={formData.segundo_apellido}
            onChange={handleChange}
          />
        </Grid>
      </Section>

      {/* =============================
          UBICACIÓN
      ============================== */}
      <Section title="Ubicación" icon={<Home size={20} />} color="green">
        <Grid cols={2}>
          <Field
            label="Nombre de la Familia"
            name="nombre_familia"
            value={formData.nombre_familia}
            onChange={handleChange}
          />

          <div>
            <Label>Tipo de Vivienda</Label>
            <div className="flex gap-2 mt-1">
              <ToggleButton
                active={tipoVivienda === "torre"}
                onClick={() => setTipoVivienda("torre")}
              >
                Torre
              </ToggleButton>
              <ToggleButton
                active={tipoVivienda === "casa"}
                onClick={() => setTipoVivienda("casa")}
              >
                Casa
              </ToggleButton>
            </div>
          </div>
        </Grid>

        {tipoVivienda === "torre" && (
          <select
            name="vivienda"
            value={formData.vivienda}
            onChange={handleChange}
            className="w-full mt-4 p-3 rounded-xl bg-gray-50 border"
          >
            <option value="">Seleccione Torre</option>
            {[...Array(13)].map((_, i) => (
              <option key={i} value={`Torre ${i + 1}`}>
                Torre {i + 1}
              </option>
            ))}
          </select>
        )}

        {tipoVivienda === "casa" && (
          <Field
            label="Dirección Exacta"
            name="vivienda"
            value={formData.vivienda}
            onChange={handleChange}
          />
        )}
      </Section>

      {/* =============================
          SEGURIDAD
      ============================== */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border text-black ">
        <Header icon={<Lock size={20} />} title="Seguridad" color="blue" dark />

        <Grid cols={4}>
          {/* Antes decía <Field dark ... />, quítale el 'dark' */}
          <Field
            label="Correo"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <PasswordField
            label="Clave Actual"
            value={formData.oldPassword}
            show={showPass.old}
            toggle={() => setShowPass((p) => ({ ...p, old: !p.old }))}
            onChange={(e) =>
              handleChange({
                target: { name: "oldPassword", value: e.target.value },
              })
            }
          />
          <PasswordField
            label="Nueva Clave"
            value={formData.newPassword}
            show={showPass.new}
            toggle={() => setShowPass((p) => ({ ...p, new: !p.new }))}
            onChange={(e) =>
              handleChange({
                target: { name: "newPassword", value: e.target.value },
              })
            }
          />
          <PasswordField
            label="Confirmar"
            value={formData.confirmPassword}
            show={showPass.confirm}
            toggle={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}
            onChange={(e) =>
              handleChange({
                target: { name: "confirmPassword", value: e.target.value },
              })
            }
          />
        </Grid>
      </div>

      {/* =============================
          BOTONES
      ============================== */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 font-bold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
};

/* =============================
   COMPONENTES AUXILIARES
============================== */
const Section = ({ title, icon, children, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border">
    <Header title={title} icon={icon} color={color} />
    {children}
  </div>
);

const Header = ({ title, icon, color, dark }) => (
  <div
    className={`flex items-center gap-2 mb-6 font-bold border-b pb-3 ${dark ? "border-slate-800" : ""} text-${color}-600`}
  >
    {icon} <span>{title}</span>
  </div>
);

const Grid = ({ children, cols = 3 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-5`}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label className="text-[10px] font-bold text-gray-400 uppercase">
    {children}
  </label>
);

const ToggleButton = ({ active, children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`flex-1 py-3 rounded-xl font-bold ${
      active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, dark, ...props }) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <input
      {...props}
      className={`rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 ${
        dark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border"
      }`}
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <select {...props} className="rounded-xl p-3 bg-gray-50 border">
      {options.map((op) => (
        <option key={op} value={op}>
          {op}
        </option>
      ))}
    </select>
  </div>
);

const PasswordField = ({ label, show, toggle, ...props }) => (
  <div className="flex flex-col gap-1 relative">
    <Label>{label}</Label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...props}
        className="w-full rounded-xl p-3 pr-10 bg-gray-50 border border-gray-200 text-black outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export default SettingsView;
