import React from "react";
import { Plus, Clock, Calendar, Mail, Phone, Home, MapPin } from "lucide-react";
import StatusBadge from "./StatusBadge";

const MemberDetailModal = ({ isOpen, onClose, member, family }) => {
  if (!isOpen || !member) return null;

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const memberAge = calculateAge(member.dob);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <div className="flex items-center space-x-4 ">
            <img
              src={
                member.avatar ||
                "https://placehold.co/100x100/3b82f6/ffffff?text=User"
              }
              alt={member.name}
              className="h-16 w-16 rounded-full object-cover shadow-md"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {member.name}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <StatusBadge status={member.status} />
                <span className="text-sm text-gray-500">
                  Último: {new Date().toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <div className="space-y-6">
          {/* SECCIÓN INFORMACIÓN PERSONAL */}
          <h3 className="text-lg sm:text-xl font-semibold text-blue-600 border-b pb-2">
            Información Personal
          </h3>
          {/* grid-cols-1 en móvil, sm:grid-cols-2 en escritorio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            {/* Edad */}
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-grow">
                <span className="font-bold mr-1 inline-block">Edad:</span>
                <span className="truncate">{memberAge}</span>
              </div>
            </div>

            {/* Fecha de Nacimiento (CORREGIDO: Ahora usa la misma estructura que Edad) */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-grow">
                <span className="font-bold mr-1 inline-block">
                  Fecha de Nacimiento:
                </span>
                <span className="truncate">
                  {new Date(member.dob).toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>

            {/* Email (ocupa dos columnas en escritorio) */}
            <div className="flex items-start space-x-3 sm:col-span-2">
              <Mail className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-grow">
                <span className="font-bold mr-1 inline-block">Email:</span>
                <span className="truncate">{member.email}</span>
              </div>
            </div>

            {/* Teléfono (ocupa dos columnas en escritorio) */}
            <div className="flex items-start space-x-3 sm:col-span-2">
              <Phone className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-grow">
                <span className="font-bold mr-1 inline-block">Teléfono:</span>
                <span className="truncate">{member.phone}</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN INFORMACIÓN FAMILIAR */}
          <h3 className="text-lg sm:text-xl font-semibold text-blue-600 border-b pb-2 pt-4">
            Información Familiar
          </h3>
          {/* grid-cols-1 en móvil, sm:grid-cols-2 en escritorio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-start space-x-3">
              <Home className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-grow">
                <span className="font-bold mr-1 inline-block">
                  Núcleo Familiar:
                </span>
                <span className="truncate">{family?.name || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-grow">
                <span className="font-bold mr-1 inline-block">Dirección:</span>
                <span className="truncate">{family?.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN INFORMACIÓN ADICIONAL */}
          <h3 className="text-lg sm:text-xl font-semibold text-blue-600 border-b pb-2 pt-4">
            Información Adicional
          </h3>
          <div className="space-y-4 text-gray-700">
            {/* Ocupación */}
            <div>
              <p className="font-bold">Ocupación:</p>
              <p className="truncate">{member.occupation}</p>
            </div>

            {/* Miembro Desde */}
            <div>
              <p className="font-bold">Miembro desde:</p>
              <p>
                {new Date(family?.registeredDate).toLocaleDateString("es-ES") ||
                  "N/A"}
              </p>
            </div>

            {/* Notas */}
            <div className="min-w-0">
              <p className="font-bold">Notas:</p>
              <p className="border p-4 rounded-lg bg-gray-50 text-gray-700 mt-2">
                {family?.notes || "Sin notas adicionales."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
