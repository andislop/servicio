import React from 'react'

// Componente para las tarjetas de métricas del Dashboard
const Metrica1 = ({ title, value,  details }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all hover:shadow-xl">
    <div className="flex justify-between items-start">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
    {details && (
      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className={`text-sm text-gray-500`}>{details}</p>
      </div>
    )}
  </div>
);

export default Metrica1