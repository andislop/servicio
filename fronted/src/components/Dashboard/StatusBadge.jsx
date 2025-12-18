import React from 'react';

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
  >
    {status}
  </span>
);

export default StatusBadge;
