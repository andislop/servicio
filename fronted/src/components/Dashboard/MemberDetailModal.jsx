import React from "react";
import { X } from "lucide-react";

const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  const d = new Date(isoDate);
  return d.toLocaleDateString("es-VE");
};

const calcularEdad = (fecha) => {
  if (!fecha) return "N/A";
  const nacimiento = new Date(fecha);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
};

const MemberDetailModal = ({ isOpen, onClose, member, family }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-blue-700">
            Información del Habitante
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Información Personal */}
          <section>
            <h3 className="text-lg font-semibold text-blue-600 border-b pb-1">
              Información Personal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-gray-700">
              <div>
                <b>Nombre:</b> {member.primer_nombre} {member.segundo_nombre}
              </div>
              <div>
                <b>Apellido:</b> {member.primer_apellido}{" "}
                {member.segundo_apellido}
              </div>
              <div>
                <b>Cédula:</b> {member.cedula}
              </div>
              <div>
                <b>Fecha de Nacimiento:</b>{" "}
                {formatDate(member.fecha_nacimiento)}
              </div>
              <div>
                <b>Sexo:</b> {member.sexo || "N/A"}
              </div>
              <div>
                <b>Teléfono:</b> {member.telefono || "N/A"}
              </div>
              <div>
                <b>Nacionalidad:</b> {member.nacionalidad || "N/A"}
              </div>
              <div>
                <b>Edad:</b> {calcularEdad(member.fecha_nacimiento)} años
              </div>
            </div>
          </section>

          {/* Información Comunitaria */}
          <section>
            <h3 className="text-lg font-semibold text-blue-600 border-b pb-1">
              Información Comunitaria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-gray-700">
              <div>
                <b>Rol:</b> {member.rol}
              </div>
              <div>
                <b>Manzanero:</b> {member.es_manzanero ? "Sí" : "No"}
              </div>
              <div>
                <b>Jefe de Calle:</b> {member.es_jefe_calle ? "Sí" : "No"}
              </div>
              <div className="sm:col-span-2">
                <b className="text-lg">Carnet de la Patria</b> <br />
                <div className="mt-1">
                  <b>Código:</b> {member.codigo_carnet || "—"} <br />
                  <b>Serial:</b> {member.serial_carnet || "—"}
                </div>
              </div>
            </div>
          </section>

          {/* Información Familiar */}
          <section>
            <h3 className="text-lg font-semibold text-blue-600 border-b pb-1">
              Información Familiar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-gray-700">
              <div>
                <b>Familia:</b> {family?.nombre_familia}
              </div>
              <div>
                <b>Vivienda:</b> {family?.vivienda || "N/A"}
              </div>
              <div>
                <b>Total de Miembros:</b> {family?.membersCount}
              </div>
            </div>
          </section>

          {/* Información Adicional */}
          <section>
            <h3 className="text-lg font-semibold text-blue-600 border-b pb-1">
              Información Adicional
            </h3>

            <p className="mt-3 p-4 bg-gray-50 border rounded-lg text-gray-700">
              {member.notes || "Sin observaciones sociales."}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
