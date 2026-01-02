import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import FamilyHeadForm from "./FamilyHeadModal";

const EditFamilyHeadModal = ({ isOpen, onClose, familyHead, onSave }) => {

  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (familyHead) {
      setFormData({
        id: familyHead.id_persona,
        nombreFamilia: familyHead.nombre_familia || "",
        vivienda: familyHead.vivienda || "",
        cedula: familyHead.cedula || "",
        primerNombre: familyHead.primer_nombre || "",
        segundoNombre: familyHead.segundo_nombre || "",
        primerApellido: familyHead.primer_apellido || "",
        segundoApellido: familyHead.segundo_apellido || "",
        fechaNacimiento: familyHead.fecha_nacimiento || "",
        sexo: familyHead.sexo || "",
        mercado: familyHead.mercado || "",
        telefono: familyHead.telefono || "",
        nacionalidad: familyHead.nacionalidad || "",
        esManzanero: familyHead.es_manzanero === 1,
        esJefeCalle: familyHead.es_jefe_calle === 1,
        carnetCodigo: familyHead.codigo_carnet || "",
        carnetSerial: familyHead.serial_carnet || "",
        email: familyHead.email || "",
        password: "",
      });
    }
  }, [familyHead]);

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
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Editar Jefe de Familia
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        {/* Formulario con datos pre-cargados */}
        <FamilyHeadForm
          initialData={formData}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default EditFamilyHeadModal;
