import React, { useState, useEffect } from "react";

const FamilyHeadModal = ({ initialData, onSave, onClose }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    familyName: "",
    address: "",
    dob: "",
    occupation: "",
    email: "",
    phone: "",
    status: "Activo",
    notes: "",
  });

  // Cargar datos correctamente desde el backend
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        name: initialData.nombre || "",
        familyName: initialData.nombreFamilia || "",
        address: initialData.direccion || "",
        dob: initialData.fechaNacimiento
          ? initialData.fechaNacimiento.split("T")[0]
          : "",
        occupation: initialData.ocupacion || "",
        email: initialData.email || "",
        phone: initialData.telefono || "",
        status: initialData.estado || "Activo",
        notes: initialData.notes || "", // por si luego lo agregas al backend
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label className="block font-medium mb-1">Nombre del Jefe de Familia</label>
        <input
          type="text"
          name="name"
          className="w-full border rounded p-2"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Nombre de la familia */}
      <div>
        <label className="block font-medium mb-1">Nombre de la Familia</label>
        <input
          type="text"
          name="familyName"
          className="w-full border rounded p-2"
          value={formData.familyName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Dirección */}
      <div>
        <label className="block font-medium mb-1">Dirección</label>
        <input
          type="text"
          name="address"
          className="w-full border rounded p-2"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <label className="block font-medium mb-1">Fecha de Nacimiento</label>
        <input
          type="date"
          name="dob"
          className="w-full border rounded p-2"
          value={formData.dob}
          onChange={handleChange}
        />
      </div>

      {/* Ocupación */}
      <div>
        <label className="block font-medium mb-1">Ocupación</label>
        <input
          type="text"
          name="occupation"
          className="w-full border rounded p-2"
          value={formData.occupation}
          onChange={handleChange}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium mb-1">Correo Electrónico</label>
        <input
          type="email"
          name="email"
          className="w-full border rounded p-2"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block font-medium mb-1">Teléfono</label>
        <input
          type="text"
          name="phone"
          className="w-full border rounded p-2"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Estado */}
      <div>
        <label className="block font-medium mb-1">Estado</label>
        <select
          name="status"
          className="w-full border rounded p-2"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {/* Notas */}
      <div>
        <label className="block font-medium mb-1">Notas</label>
        <textarea
          name="notes"
          className="w-full border rounded p-2"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
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
