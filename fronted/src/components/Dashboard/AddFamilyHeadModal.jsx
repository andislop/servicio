import React from "react";
import { Plus } from "lucide-react";
import FamilyHeadForm from "./FamilyHeadModal";

const AddFamilyHeadModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Agregar Nuevo Jefe de Familia
          </h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        {/* Formulario reutilizable */}
        <FamilyHeadForm
          initialData={null}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default AddFamilyHeadModal;
