'use client';

import React, { useState } from 'react';

interface SuspendedAccountModalProps {
  show: boolean;
  onClose: () => void;
  reactivationTimer: number;
  penaltyPrice: number;
  formatReactivationTimer: (seconds: number) => string;
  onShowPenaltyPayment: () => void;
}

const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({
  show,
  onClose,
  reactivationTimer,
  penaltyPrice,
  formatReactivationTimer,
  onShowPenaltyPayment,
}) => {
  const [showPenaltyDetails, setShowPenaltyDetails] = useState(false);

  if (!show) return null;

  const handlePayPenalty = () => {
    onShowPenaltyPayment();
  };

  const handleShowDetails = () => {
    setShowPenaltyDetails(true);
  };

  const handleCloseDetails = () => {
    setShowPenaltyDetails(false);
  };

  // Modal de detalles de sanción
  if (showPenaltyDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <i className="ri-information-line text-4xl text-blue-600 mb-4"></i>
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Detalles de la Sanción</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-red-800">
                  Monto por inactividad si pasan las 48 horas:
                </span>
                <span className="text-lg font-bold text-red-600">$20 USD</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">Rangos comprados:</span>
                <span className="text-lg font-bold text-gray-600">0</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">Pagos perdidos:</span>
                <span className="text-lg font-bold text-gray-600">0</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Total a pagar:</span>
                <span className="text-lg font-bold text-blue-600">${penaltyPrice} USD</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <i className="ri-warning-line text-yellow-600 mt-1"></i>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Importante:</p>
                <p className="text-sm text-yellow-700">
                  Si no pagas dentro de las próximas 48 horas, tu cuenta será propiedad de la
                  plataforma.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCloseDetails}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // Modal principal de cuenta suspendida
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <i className="ri-alert-line text-4xl text-red-600 mb-4"></i>
          <h3 className="text-xl font-semibold mb-4 text-red-600">Cuenta Suspendida</h3>

          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-red-800 mb-1">Tiempo para reactivar cuenta:</p>
            <p className="text-2xl font-bold text-red-600">
              {formatReactivationTimer(reactivationTimer)}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {reactivationTimer > 0
                ? 'Tienes 48 horas para reactivar'
                : 'Tiempo agotado - Cuenta perdida'}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
            <p className="text-sm text-red-700 leading-relaxed mb-3">
              <strong>Tu cuenta ha sido suspendida por inactividad.</strong>
            </p>
            <p className="text-sm text-red-700 leading-relaxed mb-3">
              {reactivationTimer > 0
                ? `Debes pagar $${penaltyPrice} USD para reactivar tu cuenta y obtener 48 horas adicionales.`
                : `Han pasado las 48 horas. Ahora debes pagar $${penaltyPrice} USD que incluye las sumas del rango comprado por la plataforma más una multa por demora.`}
            </p>
            <p className="text-sm text-red-700 leading-relaxed mb-3">
              Si no pagas dentro de las próximas 48 horas, tu cuenta será propiedad de la
              plataforma.
            </p>
            <p className="text-sm text-red-700 leading-relaxed font-semibold">
              Mientras la cuenta esté suspendida no recibirás pagos de tus referidos.
            </p>
          </div>

          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm font-medium text-red-800 mb-2">Cantidad a pagar:</p>
            <p className="text-3xl font-bold text-red-600">${penaltyPrice} USD</p>
            <p className="text-xs text-red-600 mt-1">
              {reactivationTimer > 0 ? '48 horas adicionales' : 'Multa por demora incluida'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePayPenalty}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-semibold"
            >
              <i className="ri-money-dollar-circle-line mr-2"></i>
              Pagar sanción
            </button>

            <button
              onClick={handleShowDetails}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-semibold"
            >
              <i className="ri-information-line mr-2"></i>
              Ver detalles de la sanción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspendedAccountModal;
