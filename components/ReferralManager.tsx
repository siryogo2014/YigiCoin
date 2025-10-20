'use client';

import React, { useState, useEffect } from 'react';
import { useReferralLinks } from '../hooks/useReferralLinks';

interface ReferralManagerProps {
  userId: string;
  userLevel?: number;
}

interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface LevelLimit {
  maxReferrals: number;
  price: number;
}

function ReferralManager({ userId, userLevel = 1 }: ReferralManagerProps) {
  const referralLinks = useReferralLinks(userId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const levelLimits: Record<number, LevelLimit> = {
    1: { maxReferrals: 2, price: 3 },
    2: { maxReferrals: 4, price: 5 },
    3: { maxReferrals: 8, price: 10 },
    4: { maxReferrals: 16, price: 50 },
    5: { maxReferrals: 32, price: 400 },
    6: { maxReferrals: 64, price: 6000 },
  };

  const currentLimit = levelLimits[userLevel] || levelLimits[1];
  const userReferrals = referralLinks.getUserReferrals();
  const availableLinks = referralLinks.getAvailableLinks();
  const userLinks = referralLinks.getUserLinks();

  const showNotification = (type: 'success' | 'error' | 'info', message: string): void => {
    if (!mounted) return;

    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const generateNewLinks = async (): Promise<void> => {
    if (!mounted || !referralLinks.canGenerateMoreLinks()) {
      showNotification('error', 'Has alcanzado el límite máximo de referidos para tu nivel');
      return;
    }

    setIsGenerating(true);
    try {
      referralLinks.generateInitialLinks();
      showNotification('success', 'Enlaces de referido generados exitosamente');
    } catch (error) {
      showNotification('error', 'Error al generar enlaces de referido');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    if (!mounted) return;

    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showNotification('success', 'Enlace copiado al portapapeles');
      }
    } catch (error) {
      showNotification('error', 'Error al copiar enlace');
    }
  };

  const invalidateLink = (linkId: string): void => {
    if (!mounted) return;

    referralLinks.invalidateLink(linkId);
    showNotification('info', 'Enlace invalidado correctamente');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <i
              className={`${
                notification.type === 'success'
                  ? 'ri-check-line'
                  : notification.type === 'error'
                    ? 'ri-error-warning-line'
                    : 'ri-information-line'
              }`}
            ></i>
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Referidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{userReferrals.length}</p>
              <p className="text-sm text-gray-600">Referidos Activos</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{availableLinks.length}</p>
              <p className="text-sm text-gray-600">Enlaces Disponibles</p>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {currentLimit.maxReferrals - userReferrals.length}
              </p>
              <p className="text-sm text-gray-600">Cupos Restantes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Enlaces de Referido</h3>
          {referralLinks.canGenerateMoreLinks() && (
            <button
              onClick={generateNewLinks}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isGenerating
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generando...
                </div>
              ) : (
                'Generar Enlaces'
              )}
            </button>
          )}
        </div>

        {userLinks.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-link-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 mb-4">No tienes enlaces de referido aún</p>
            <button
              onClick={generateNewLinks}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Generar Mis Primeros Enlaces
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userLinks.map((link, index) => (
              <div key={link.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Enlace {index + 1}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        link.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {link.isUsed ? 'Usado' : 'Disponible'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                    >
                      <i className="ri-file-copy-line mr-1"></i>
                      Copiar
                    </button>
                    {!link.isUsed && (
                      <button
                        onClick={() => invalidateLink(link.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                      >
                        <i className="ri-close-line mr-1"></i>
                        Invalidar
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-sm text-gray-800 font-mono break-all">{link.url}</p>
                </div>
                {link.isUsed && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>
                      Usado el {link.usedAt?.toLocaleString()} por {link.usedBy}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis Referidos</h3>

        {userReferrals.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">Aún no tienes referidos</p>
            <p className="text-sm text-gray-500 mt-2">
              Comparte tus enlaces de referido para comenzar a ganar comisiones
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userReferrals.map((referral) => (
              <div key={referral.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{referral.name}</h4>
                      <p className="text-sm text-gray-600">{referral.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Registrado</p>
                    <p className="text-sm font-medium text-gray-800">
                      {referral.registeredAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <i className="ri-information-line text-blue-600"></i>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Sistema de Referidos Únicos:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Cada enlace solo puede usarse una vez</li>
              <li>
                • Límite actual: {userReferrals.length}/{currentLimit.maxReferrals} referidos
              </li>
              <li>• Precio por registro: ${currentLimit.price} USD</li>
              <li>• Los enlaces se invalidan automáticamente después del uso</li>
              <li>• Los referidos quedan vinculados permanentemente a tu cuenta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferralManager;
