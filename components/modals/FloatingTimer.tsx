'use client';

import React from 'react';

interface FloatingTimerProps {
  show: boolean;
  timer: number;
  onResetTimer: () => void;
  // NUEVO: Props para sincronizar el cooldown
  updateButtonCooldown?: number;
  isUpdateButtonDisabled?: boolean;
}

function FloatingTimer({
  show,
  timer,
  onResetTimer,
  // NUEVO: Valores por defecto para el cooldown
  updateButtonCooldown = 0,
  isUpdateButtonDisabled = false,
}: FloatingTimerProps) {
  // Solo mostrar cuando show es true, el timer está entre 1 y 60 segundos
  if (!show || timer > 60 || timer <= 0) return null;

  // NUEVO: Función para formatear el cooldown
  const formatCooldown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // MODIFICADO: Usar la misma función que los otros botones
  const handleUpdateTimer = (): void => {
    if (typeof onResetTimer === 'function' && !isUpdateButtonDisabled) {
      onResetTimer();
    }
  };

  return (
    <div
      onClick={handleUpdateTimer}
      className={`fixed bottom-4 left-4 px-4 py-3 rounded-full shadow-lg z-50 transition-colors ${
        isUpdateButtonDisabled
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-red-500 text-white animate-pulse cursor-pointer hover:bg-red-600'
      }`}
    >
      <div className="flex items-center space-x-2">
        <i className="ri-time-line text-xl"></i>
        <div className="text-sm">
          {isUpdateButtonDisabled ? (
            <>
              <p className="font-semibold">Actualizar en:</p>
              <p className="text-xs">{formatCooldown(updateButtonCooldown)}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">¡Tiempo agotándose!</p>
              <p className="text-xs">
                Quedan: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-xs opacity-75">Click para reiniciar</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FloatingTimer;
