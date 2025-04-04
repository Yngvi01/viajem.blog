import React, { useState } from 'react';

export function DestinoCard({ destino, imagem, descricao, atracoes, melhorEpoca }) {
  const [mostrarMais, setMostrarMais] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden shadow-md mb-6 bg-white dark:bg-gray-800">
      {imagem && (
        <div className="h-48 overflow-hidden">
          <img 
            src={imagem} 
            alt={`Imagem de ${destino}`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-[var(--text-color)]">{destino}</h3>
        
        <p className="mt-2 text-[var(--text-color-lighten)]">{descricao}</p>
        
        <div className="mt-3">
          <span className="text-sm font-semibold block text-[var(--primary-color)]">
            Melhor época para visitar:
          </span>
          <span className="text-sm text-[var(--text-color)]">{melhorEpoca}</span>
        </div>
        
        {mostrarMais && (
          <div className="mt-4">
            <span className="text-sm font-semibold block text-[var(--primary-color)]">
              Principais atrações:
            </span>
            <ul className="list-disc pl-5 mt-1">
              {atracoes.map((atracao, index) => (
                <li key={index} className="text-sm text-[var(--text-color)]">{atracao}</li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          onClick={() => setMostrarMais(!mostrarMais)}
          className="mt-4 text-sm text-[var(--primary-color)] hover:underline focus:outline-none"
        >
          {mostrarMais ? 'Mostrar menos' : 'Mostrar mais'}
        </button>
      </div>
    </div>
  );
}