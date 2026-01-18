import React, { useState, useEffect } from "react";

const AddMemberModal = ({ familyName, onSave, onClose, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    cedula: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    fechaNacimiento: "",
    sexo: "Masculino",
    nacionalidad: "Venezolana",
    telefono: "",
    carnetCodigo: "",
    carnetSerial: "",
  });

useEffect(() => {
  if (isEditing && initialData) {
    console.log("Datos recibidos en Modal:", initialData);
    setFormData({
      // Si estos campos salen vacíos, es porque NO vienen en el initialData
      cedula: initialData.cedula || "", 
      primerNombre: initialData.primer_nombre || "",
      segundoNombre: initialData.segundo_nombre || "",
      primerApellido: initialData.primer_apellido || "",
      segundoApellido: initialData.segundo_apellido || "",
      // Formateo de fecha
      fechaNacimiento: initialData.fecha_nacimiento ? initialData.fecha_nacimiento.split('T')[0] : "",
      sexo: initialData.sexo || "Masculino",
      telefono: initialData.telefono || "",
      nacionalidad: initialData.nacionalidad || "Venezolana",
      carnetCodigo: initialData.codigo_carnet || "",
      carnetSerial: initialData.serial_carnet || ""
    });
  }
  console.log(initialData);
  
}, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pasamos el objeto completo. Dashboard decidirá si es POST o PUT
    onSave({ ...formData, id_persona: initialData?.id_persona });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[95vh] p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? "Editar Miembro" : "Agregar Miembro"}
            </h2>
            <p className="text-sm text-blue-600 font-medium">Núcleo: {familyName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Cédula *</label>
              <input type="text" name="cedula" value={formData.cedula} className="w-full border rounded-md p-2" onChange={handleChange} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
              <select name="nacionalidad" value={formData.nacionalidad} className="w-full border rounded-md p-2" onChange={handleChange}>
                <option value="Venezolana">Venezolana</option>
                <option value="Extranjera">Extranjera</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="primerNombre" value={formData.primerNombre} placeholder="Primer Nombre *" className="border rounded-md p-2" onChange={handleChange} required />
            <input type="text" name="segundoNombre" value={formData.segundoNombre} placeholder="Segundo Nombre" className="border rounded-md p-2" onChange={handleChange} />
            <input type="text" name="primerApellido" value={formData.primerApellido} placeholder="Primer Apellido *" className="border rounded-md p-2" onChange={handleChange} required />
            <input type="text" name="segundoApellido" value={formData.segundoApellido} placeholder="Segundo Apellido" className="border rounded-md p-2" onChange={handleChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">F. Nacimiento</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} className="w-full border rounded-md p-2" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Sexo</label>
              <select name="sexo" value={formData.sexo} className="w-full border rounded-md p-2" onChange={handleChange}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} className="w-full border rounded-md p-2" onChange={handleChange} />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block font-bold text-gray-700 mb-2 text-sm">Carnet de la Patria</label>
            <div className="flex gap-4">
              <input type="text" name="carnetCodigo" value={formData.carnetCodigo} placeholder="Código" className="flex-1 border rounded-md p-2" onChange={handleChange} />
              <input type="text" name="carnetSerial" value={formData.carnetSerial} placeholder="Serial" className="flex-1 border rounded-md p-2" onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700 transition-colors">
              {isEditing ? "Guardar Cambios" : "Registrar Miembro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;