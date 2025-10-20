'use client';

import React from 'react';

interface ContadorUsuarioProps {
  timer: number;
  isPageBlocked: boolean;
  resetTimer: () => void;
  updateTimer: () => void;
  setShowTimerModal: () => void;
  setShowInfoModal: () => void;
  updateButtonCooldown?: number;
  isUpdateButtonDisabled?: boolean;
}

function ContadorUsuario({
  timer = 0,
  isPageBlocked = false,
  resetTimer,
  updateTimer,
  setShowTimerModal,
  setShowInfoModal,
  updateButtonCooldown = 0,
  isUpdateButtonDisabled = false,
}: ContadorUsuarioProps) {
  const formatTimer = (seconds: number): string => {
    const safeSeconds = Math.max(0, seconds || 0);
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerModalClick = (): void => {
    if (!isPageBlocked && typeof setShowTimerModal === 'function') {
      setShowTimerModal();
    }
  };

  const handleInfoClick = (): void => {
    if (!isPageBlocked && typeof setShowInfoModal === 'function') {
      setShowInfoModal();
    }
  };

  const timeStatus = timer <= 0 ? 'expired' : timer <= 300 ? 'warning' : 'normal';

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 sm:p-8 text-white max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">Estado de la Cuenta</h3>

        <div className="mb-6">
          <div className="text-4xl sm:text-6xl font-mono font-bold mb-2">{formatTimer(timer)}</div>
          <p className="text-sm sm:text-base opacity-90">
            {timeStatus === 'expired'
              ? 'Cuenta suspendida'
              : timeStatus === 'warning'
                ? 'Tiempo crítico'
                : 'Tiempo restante activo'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={handleTimerModalClick}
            disabled={timer === 0 || isPageBlocked}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              timer > 0 && !isPageBlocked
                ? 'bg-white text-blue-600 hover:bg-gray-100'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            <i className="ri-add-circle-line mr-2"></i>
            Extender Tiempo
          </button>

          <button
            onClick={handleInfoClick}
            disabled={isPageBlocked}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isPageBlocked
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            <i className="ri-information-line mr-2"></i>
            Información
          </button>
        </div>

        {timer <= 300 && timer > 0 && (
          <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3">
            <p className="text-sm">
              <i className="ri-alert-line mr-2"></i>
              Tu cuenta se suspenderá pronto. Extiende tu tiempo para mantenerla activa.
            </p>
          </div>
        )}

        {timer <= 0 && (
          <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg p-3">
            <p className="text-sm">
              <i className="ri-error-warning-line mr-2"></i>
              Cuenta suspendida. Paga la sanción para reactivarla.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContadorUsuario;
