import React from 'react';

export function Button({ text, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color-darken)] transition-colors ${className || ''}`}
    >
      {text}
    </button>
  );
}