import React, { useState } from "react";

export function DestinoCard({
  destino,
  imagem,
  descricao,
  atracoes,
  melhorEpoca,
}) {
  const [mostrarMais, setMostrarMais] = useState(false);

  return (
    <div className="border-[var(--primary-color-lighten)]/30 mb-6 overflow-hidden rounded-lg border bg-[var(--card-color)] shadow-md">
      {imagem && (
        <div className="h-48 overflow-hidden">
          <img
            src={imagem}
            alt={`Imagem de ${destino}`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-bold text-[var(--text-color)]">
          {destino}
        </h3>

        <p className="mt-2 text-[var(--text-color-lighten)]">{descricao}</p>

        <div className="mt-3">
          <span className="block text-sm font-semibold text-[var(--primary-color)]">
            Melhor época para visitar:
          </span>
          <span className="text-sm text-[var(--text-color)]">
            {melhorEpoca}
          </span>
        </div>

        {mostrarMais && (
          <div className="mt-4">
            <span className="block text-sm font-semibold text-[var(--primary-color)]">
              Principais atrações:
            </span>
            <ul className="mt-1 list-disc pl-5">
              {atracoes.map((atracao, index) => (
                <li key={index} className="text-sm text-[var(--text-color)]">
                  {atracao}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setMostrarMais(!mostrarMais)}
          className="mt-4 text-sm text-[var(--primary-color)] hover:underline focus:outline-none"
        >
          {mostrarMais ? "Mostrar menos" : "Mostrar mais"}
        </button>
      </div>
    </div>
  );
}
