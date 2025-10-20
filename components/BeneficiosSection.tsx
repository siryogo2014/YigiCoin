'use client';

import React, { useState } from 'react';

interface BeneficiosSectionProps {
  currentRank: string;
  digitalBooks: string[];
  lotteries: string[];
  selectedTheme?: string;
}

function BeneficiosSection({
  currentRank,
  digitalBooks = [],
  lotteries = [],
  selectedTheme = 'claro',
}: BeneficiosSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState('sorteos');

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  const renderSorteos = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3
        className={`text-lg sm:text-xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Sorteos Disponibles
      </h3>

      {/* Sorteos básicos para rango Básico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div
          className={`bg-gradient-to-br ${
            selectedTheme === 'oscuro'
              ? 'from-gray-700 to-gray-800 border-gray-600'
              : 'from-blue-50 to-blue-100 border-blue-200'
          } border rounded-xl p-4 sm:p-6`}
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-gift-line text-2xl text-white"></i>
            </div>
            <h4
              className={`text-lg font-bold ${selectedTheme === 'oscuro' ? 'text-blue-400' : 'text-blue-800'}`}
            >
              Sorteo Semanal
            </h4>
            <p
              className={`text-sm ${selectedTheme === 'oscuro' ? 'text-blue-300' : 'text-blue-600'}`}
            >
              Disponible para miembros Básico+
            </p>
          </div>
          <div className="space-y-3">
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-blue-100'} rounded-lg p-3 border`}
            >
              <p
                className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Premio Principal
              </p>
              <p className="text-lg font-bold text-green-600">$500 USD</p>
            </div>
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-blue-100'} rounded-lg p-3 border`}
            >
              <p
                className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Próximo Sorteo
              </p>
              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Domingo 25 Enero 2024
              </p>
            </div>
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-blue-100'} rounded-lg p-3 border`}
            >
              <p
                className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Participantes
              </p>
              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                1,234 inscritos
              </p>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Participar Gratis
            </button>
          </div>
        </div>

        <div
          className={`bg-gradient-to-br ${
            selectedTheme === 'oscuro'
              ? 'from-gray-700 to-gray-800 border-gray-600'
              : 'from-green-50 to-green-100 border-green-200'
          } border rounded-xl p-4 sm:p-6`}
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-trophy-line text-2xl text-white"></i>
            </div>
            <h4
              className={`text-lg font-bold ${selectedTheme === 'oscuro' ? 'text-green-400' : 'text-green-800'}`}
            >
              Sorteo Mensual
            </h4>
            <p
              className={`text-sm ${selectedTheme === 'oscuro' ? 'text-green-300' : 'text-green-600'}`}
            >
              Premios especiales
            </p>
          </div>
          <div className="space-y-3">
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-green-100'} rounded-lg p-3 border`}
            >
              <p
                className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Premio Principal
              </p>
              <p className="text-lg font-bold text-green-600">$2,000 USD</p>
            </div>
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-green-100'} rounded-lg p-3 border`}
            >
              <p
                className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Próximo Sorteo
              </p>
              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                31 Enero 2024
              </p>
            </div>
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-green-100'} rounded-lg p-3 border`}
            >
              <p
                className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Tus Participaciones
              </p>
              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                3 boletos
              </p>
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              Ver Mis Boletos
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLibros = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3
        className={`text-lg sm:text-xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Biblioteca Digital
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {digitalBooks.map((book, index) => (
          <div
            key={index}
            className={`${
              selectedTheme === 'oscuro'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-200'
            } border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow`}
          >
            <div className="text-center mb-4">
              <div className="w-16 h-20 bg-gradient-to-b from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                <i className="ri-book-open-line text-2xl text-white"></i>
              </div>
              <h4
                className={`text-base sm:text-lg font-bold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                {book}
              </h4>
            </div>
            <div className="space-y-3">
              <div
                className={`${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-50'} rounded-lg p-3`}
              >
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Formato: PDF + Audio
                </p>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Páginas: 150-200
                </p>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Idioma: Español
                </p>
              </div>
              <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer text-sm">
                Descargar Ahora
              </button>
              <button className="w-full border border-orange-600 text-orange-600 py-2 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer text-sm">
                Vista Previa
              </button>
            </div>
          </div>
        ))}
      </div>

      {digitalBooks.length === 0 && (
        <div className="text-center py-8">
          <div
            className={`w-16 h-16 ${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <i
              className={`ri-book-line text-2xl ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-400'}`}
            ></i>
          </div>
          <p className={selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}>
            No tienes libros digitales disponibles
          </p>
          <p
            className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-500' : 'text-gray-400'}`}
          >
            Asciende de nivel para acceder a más contenido
          </p>
        </div>
      )}
    </div>
  );

  const renderLoterias = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3
        className={`text-lg sm:text-xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Loterías Exclusivas
      </h3>

      {lotteries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {lotteries.map((lottery, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${
                selectedTheme === 'oscuro'
                  ? 'from-gray-700 to-gray-800 border-gray-600'
                  : 'from-purple-50 to-purple-100 border-purple-200'
              } border rounded-xl p-4 sm:p-6`}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-vip-crown-line text-2xl text-white"></i>
                </div>
                <h4
                  className={`text-lg font-bold ${selectedTheme === 'oscuro' ? 'text-purple-400' : 'text-purple-800'}`}
                >
                  {lottery}
                </h4>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-purple-300' : 'text-purple-600'}`}
                >
                  Exclusivo para Premium+
                </p>
              </div>
              <div className="space-y-3">
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-purple-100'} rounded-lg p-3 border`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Premio Acumulado
                  </p>
                  <p className="text-xl font-bold text-purple-600">$10,000 USD</p>
                </div>
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-600 border-gray-500' : 'bg-white border-purple-100'} rounded-lg p-3 border`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Probabilidad de Ganar
                  </p>
                  <p
                    className={`text-sm ${selectedTheme === 'oscuro' ? 'text-purple-300' : 'text-purple-600'}`}
                  >
                    1 en 50 (Premium)
                  </p>
                </div>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                  Comprar Boleto - $10
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div
            className={`w-16 h-16 ${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <i
              className={`ri-vip-crown-line text-2xl ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-400'}`}
            ></i>
          </div>
          <p className={selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}>
            Loterías disponibles solo para Premium y Elite
          </p>
          <p
            className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-500' : 'text-gray-400'}`}
          >
            Asciende a Premium para acceder a loterías exclusivas
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <h2
        className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Beneficios del Nivel {currentRank}
      </h2>

      {/* Sub-navegación */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-2 mb-4 sm:mb-6`}
      >
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => handleSubTabChange('sorteos')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm cursor-pointer ${
              activeSubTab === 'sorteos'
                ? 'bg-blue-600 text-white'
                : selectedTheme === 'oscuro'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-gift-line mr-2"></i>
            Sorteos
          </button>
          <button
            onClick={() => handleSubTabChange('libros')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm cursor-pointer ${
              activeSubTab === 'libros'
                ? 'bg-blue-600 text-white'
                : selectedTheme === 'oscuro'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-book-open-line mr-2"></i>
            Libros Digitales
          </button>
          {lotteries.length > 0 && (
            <button
              onClick={() => handleSubTabChange('loterias')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm cursor-pointer ${
                activeSubTab === 'loterias'
                  ? 'bg-blue-600 text-white'
                  : selectedTheme === 'oscuro'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="ri-vip-crown-line mr-2"></i>
              Loterías
            </button>
          )}
        </div>
      </div>

      {/* Contenido de las sub-secciones */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}
      >
        {activeSubTab === 'sorteos' && renderSorteos()}
        {activeSubTab === 'libros' && renderLibros()}
        {activeSubTab === 'loterias' && renderLoterias()}
      </div>
    </div>
  );
}

export default BeneficiosSection;
