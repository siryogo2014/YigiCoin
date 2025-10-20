'use client';

import React from 'react';
import { useReferralLinks } from '../hooks/useReferralLinks';

interface Referido {
  id: number;
  name: string;
  email: string;
  registeredAt: Date;
}

interface SeccionReferidosProps {
  referidos: Referido[];
  promotorMessage: string;
  setPromotorMessage: (message: string) => void;
  isEditingPromotorMessage: boolean;
  setIsEditingPromotorMessage: (editing: boolean) => void;
  handleEditPromotorMessage: () => void;
  handleSavePromotorMessage: () => void;
  handleCancelPromotorMessage: () => void;
  selectedTheme?: string;
}

const SeccionReferidos: React.FC<SeccionReferidosProps> = ({
  referidos = [],
  promotorMessage,
  setPromotorMessage,
  isEditingPromotorMessage,
  setIsEditingPromotorMessage,
  handleEditPromotorMessage,
  handleSavePromotorMessage,
  handleCancelPromotorMessage,
  selectedTheme = 'claro',
}) => {
  const referralLinks = useReferralLinks();

  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Enlace copiado al portapapeles');
    }
  };

  const userLevel = 1;
  const maxReferidos = 2;

  // Enlaces simulados
  const enlaceUsado = 'https://yigicoin.com/registro/ref-abc123xyz-used';
  const enlaceDisponible = 'https://yigicoin.com/registro/ref-def456uvw-active';

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <h2
        className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Mis Referidos
      </h2>

      {/* Mis Referidos Directos con tema oscuro */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto`}
      >
        <h4
          className={`text-base sm:text-lg font-semibold mb-4 flex items-center ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          <i className="ri-group-line text-blue-500 mr-2 text-lg sm:text-xl"></i>
          Mis Referidos Directos
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Primer Referido - ACTIVO */}
          <div className="space-y-3 sm:space-y-4">
            <div
              className={`bg-gradient-to-r border rounded-lg p-3 sm:p-4 ${selectedTheme === 'oscuro' ? 'from-green-900/40 to-blue-900/40 border-green-600' : 'from-green-50 to-blue-50 border-green-200'}`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-line text-white text-base sm:text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h5
                    className={`font-semibold text-sm sm:text-base truncate ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                  >
                    María González
                  </h5>
                  <p
                    className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Nivel: Invitado
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs text-green-600 font-medium">Activo</span>
                  </div>
                </div>
              </div>
              <div
                className={`mt-3 text-xs sm:text-sm grid grid-cols-2 gap-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <p>
                  Sus referidos: <span className="font-semibold text-blue-600">2</span>
                </p>
                <p>
                  Sub-referidos: <span className="font-semibold text-purple-600">1</span>
                </p>
              </div>
            </div>

            {/* Enlace usado debajo del primer referido */}
            <div
              className={`rounded-lg p-3 border ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-1 sm:space-y-0">
                <label
                  className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Enlace de Registro 1<span className="text-red-600 ml-2 font-bold">Usado</span>
                </label>
              </div>
              <div
                className={`border rounded-lg p-2 text-xs font-mono break-all overflow-hidden opacity-60 ${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600 text-gray-500' : 'bg-gray-200 border-gray-300 text-gray-500'}`}
              >
                {enlaceUsado}
              </div>
              <div
                className={`mt-2 flex items-start text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <i className="ri-close-circle-line text-red-500 mr-1 mt-0.5 flex-shrink-0"></i>
                <span className="break-words">
                  Enlace utilizado por María González el 15/01/2024
                </span>
              </div>
            </div>
          </div>

          {/* Segundo Referido - VACÍO */}
          <div className="space-y-3 sm:space-y-4">
            <div
              className={`border rounded-lg p-3 sm:p-4 ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="text-center py-6 sm:py-8">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-300'}`}
                >
                  <i className="ri-user-line text-gray-400 text-base sm:text-lg"></i>
                </div>
                <p className="text-gray-400 font-medium text-sm sm:text-base">Aún sin referido</p>
              </div>
            </div>

            {/* Enlace disponible debajo del segundo cuadro */}
            <div
              className={`rounded-lg p-3 border ${selectedTheme === 'oscuro' ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-200'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-1 sm:space-y-0">
                <label
                  className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Enlace de Registro 2<span className="text-green-600 ml-2">Disponible</span>
                </label>
                <button
                  onClick={() => copyToClipboard(enlaceDisponible)}
                  className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer self-start sm:self-center"
                >
                  <i className="ri-file-copy-line mr-1"></i>
                  Copiar
                </button>
              </div>
              <div
                className={`border rounded-lg p-2 text-xs font-mono break-all overflow-hidden ${selectedTheme === 'oscuro' ? 'bg-gray-800 border-green-600 text-gray-200' : 'bg-white border-green-300 text-gray-800'}`}
              >
                {enlaceDisponible}
              </div>
              <div
                className={`mt-2 flex items-start text-xs ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                <i className="ri-check-circle-line text-green-500 mr-1 mt-0.5 flex-shrink-0"></i>
                <span className="break-words">Enlace activo y listo para usar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen consolidado con tema oscuro */}
        <div
          className={`mt-6 sm:mt-8 rounded-lg p-4 ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">1</p>
              <p
                className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Referidos Directos
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">3</p>
              <p
                className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Sub-referidos
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">4</p>
              <p
                className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Red Total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Mensaje para Referidos con tema oscuro */}
      <div
        className={`border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 ${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h3
            className={`text-base sm:text-lg font-semibold flex items-center ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
          >
            <i className="ri-message-2-line text-blue-500 mr-2"></i>
            Mensaje para tus Referidos
          </h3>
          {!isEditingPromotorMessage ? (
            <button
              onClick={handleEditPromotorMessage}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center cursor-pointer self-start sm:self-center"
            >
              <i className="ri-edit-line mr-1"></i>
              Editar
            </button>
          ) : (
            <div className="flex items-center space-x-2 self-start sm:self-center">
              <button
                onClick={handleSavePromotorMessage}
                className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center cursor-pointer"
              >
                <i className="ri-save-line mr-1"></i>
                Guardar
              </button>
              <button
                onClick={handleCancelPromotorMessage}
                className={`text-sm font-medium flex items-center cursor-pointer ${selectedTheme === 'oscuro' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <i className="ri-close-line mr-1"></i>
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div
          className={`bg-gradient-to-r border rounded-lg p-4 ${selectedTheme === 'oscuro' ? 'from-blue-900/30 to-purple-900/30 border-blue-600' : 'from-blue-50 to-purple-50 border-blue-200'}`}
        >
          <p
            className={`text-xs sm:text-sm mb-3 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Escribe un mensaje personalizado que verán tus referidos cuando accedan a su panel de
            promotor.
          </p>

          {isEditingPromotorMessage ? (
            <div className="space-y-3">
              <textarea
                value={promotorMessage}
                onChange={(e) => setPromotorMessage(e.target.value)}
                className={`w-full border rounded-lg p-3 sm:p-4 text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
                placeholder="Ejemplo: ¡Hola! Bienvenido a nuestro equipo. Te comparto algunos consejos para que maximices tus ganancias en YigiCoin. Recuerda mantener tu cuenta activa y compartir tus enlaces de forma estratégica..."
                rows={4}
                maxLength={500}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <p
                  className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {promotorMessage.length}/500 caracteres
                </p>
                <div className="flex items-center space-x-2">
                  <i className="ri-information-line text-blue-500 text-sm"></i>
                  <p className="text-xs text-blue-600">
                    Este mensaje será visible para todos tus referidos
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg p-3 sm:p-4 border ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'}`}
            >
              <p
                className={`leading-relaxed text-xs sm:text-sm break-words ${selectedTheme === 'oscuro' ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {promotorMessage ||
                  'Aún no has escrito un mensaje personalizado para tus referidos. Haz clic en "Editar" para agregar uno.'}
              </p>
              {promotorMessage && (
                <div
                  className={`mt-3 flex items-center text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <i className="ri-check-line text-green-500 mr-1"></i>
                  Mensaje activo - Visible para tus referidos
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información del sistema con tema oscuro */}
      <div
        className={`p-3 sm:p-4 rounded-lg border ${selectedTheme === 'oscuro' ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-200'}`}
      >
        <div className="flex items-start space-x-2 mb-2">
          <i className="ri-information-line text-blue-600 text-lg sm:text-xl mt-0.5 flex-shrink-0"></i>
          <div className="min-w-0">
            <p
              className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-blue-300' : 'text-blue-800'}`}
            >
              Sistema de Enlaces Únicos:
            </p>
            <ul
              className={`text-xs sm:text-sm space-y-1 ${selectedTheme === 'oscuro' ? 'text-blue-200' : 'text-blue-700'}`}
            >
              <li>• Referidos actuales: 1/2</li>
              <li>• Cada enlace funciona solo una vez</li>
              <li>• Se invalida automáticamente después del uso</li>
              <li>• Nuevos usuarios deben pagar $3 USD para completar registro</li>
              <li>• Los referidos quedan vinculados a tu cuenta permanentemente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeccionReferidos;
