import React from 'react'

function ActionButton({ icon: Icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
        color === 'red'
          ? 'bg-red-50 text-red-700 hover:bg-red-100'
          : color === 'green'
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{label}</span>
    </button>
  );
}

export default ActionButton