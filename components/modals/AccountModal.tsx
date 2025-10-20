'use client';

import React from 'react';
import { useAccount } from '../../hooks/useAccount';

interface AccountModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ show, onClose, onSuccess }) => {
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    paypalEmail,
    metamaskAddress,
    updateAccountData,
    resetAccountData,
    validateAccountData,
  } = useAccount();

  if (!show) return null;

  const handleSubmit = () => {
    const { isValid, errors } = validateAccountData();

    if (!isValid) {
      alert(errors.join('\n'));
      return;
    }

    // Aquí iría la lógica para actualizar la cuenta
    alert('Configuración guardada exitosamente');
    resetAccountData();
    onSuccess();
  };

  const handleClose = () => {
    resetAccountData();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <i className="ri-user-settings-line text-4xl text-blue-600 mb-4"></i>
          <h3 className="text-xl font-semibold mb-4">Configurar Cuenta</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => updateAccountData('currentPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña actual"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => updateAccountData('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Deja vacío si no quieres cambiarla"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => updateAccountData('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirma tu nueva contraseña"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email de PayPal</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => updateAccountData('paypalEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de MetaMask
            </label>
            <input
              type="text"
              value={metamaskAddress}
              onChange={(e) => updateAccountData('metamaskAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0x..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <i className="ri-warning-line text-yellow-600 mt-1"></i>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Importante:</p>
                <p className="text-sm text-yellow-700">
                  Debes ingresar tu contraseña actual para guardar cualquier cambio. Esta
                  información se utilizará para procesar tus pagos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
            >
              Guardar Cambios
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
