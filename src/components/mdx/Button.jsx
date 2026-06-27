import React from "react";

export function Button({ text, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md bg-[var(--primary-color)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-color-darken)] ${className || ""}`}
    >
      {text}
    </button>
  );
}
