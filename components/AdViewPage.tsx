'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../hooks/useSimulation';

interface AdViewPageProps {
  adId: string;
  adTitle: string;
  adUrl: string;
  selectedTheme?: string;
  onClose: () => void;
  onPointsClaimed: () => void;
}

function AdViewPage({
  adId,
  adTitle,
  adUrl,
  selectedTheme = 'claro',
  onClose,
  onPointsClaimed,
}: AdViewPageProps) {
  const { claimAdPoints, simulationState } = useSimulation();
  const [progress, setProgress] = useState(0);
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [canClaim, setCanClaim] = useState(true);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');

  // Verificar si el usuario puede reclamar puntos de este anuncio
  useEffect(() => {
    const checkClaimStatus = () => {
      const existingView = simulationState.adViews.find(
        (view) => view.adId === adId && view.userId === 'current_user'
      );

      if (existingView) {
        const nextClaimTime = new Date(existingView.nextClaimTime);
        const now = new Date();

        if (nextClaimTime > now) {
          setCanClaim(false);
          const diff = nextClaimTime.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilNextClaim(`${hours}h ${minutes}m restantes`);
        } else {
          setCanClaim(true);
        }
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 1000);
    return () => clearInterval(interval);
  }, [adId, simulationState.adViews]);

  // Iniciar el progreso de 5 segundos solo si puede reclamar
  useEffect(() => {
    if (!canClaim) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / 5; // 100% en 5 segundos

        if (newProgress >= 100) {
          setShowClaimButton(true);
          clearInterval(progressInterval);
          return 100;
        }

        return newProgress;
      });

      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [canClaim]);

  // Redireccionar a la página del anuncio
  useEffect(() => {
    if (adUrl && canClaim) {
      // Abrir la página del anuncio en una nueva pestaña
      window.open(adUrl, '_blank');
    }
  }, [adUrl, canClaim]);

  const handleClaimPoints = async () => {
    const success = claimAdPoints(adId);
    if (success) {
      onPointsClaimed();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-2xl border max-w-md w-full mx-4 overflow-hidden`}
      >
        {/* Barra de progreso fija en la parte superior */}
        <div className="relative h-3 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-linear relative"
            style={{ width: `${progress}%` }}
          >
            {/* Botón de reclamar puntos dentro de la barra */}
            {showClaimButton && canClaim && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleClaimPoints}
                  className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-50 transition-colors cursor-pointer shadow-md border border-green-200"
                >
                  Reclamar 5 Puntos
                </button>
              </div>
            )}

            {/* Mostrar tiempo restante si no puede reclamar */}
            {!canClaim && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Bloqueado: {timeUntilNextClaim}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3
              className={`text-xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Visualizando Anuncio
            </h3>

            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-4`}
            >
              <h4
                className={`font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                {adTitle}
              </h4>
              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {adUrl}
              </p>
            </div>

            {canClaim ? (
              <div className="space-y-3">
                {!showClaimButton ? (
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold mb-2 ${selectedTheme === 'oscuro' ? 'text-blue-400' : 'text-blue-600'}`}
                    >
                      {timeRemaining}
                    </div>
                    <p
                      className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      La página se ha abierto en una nueva pestaña...
                    </p>
                    <p
                      className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      Espera {timeRemaining} segundos para reclamar puntos
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-lg ${selectedTheme === 'oscuro' ? 'bg-green-800 border-green-600' : 'bg-green-50 border-green-200'} border mb-4`}
                    >
                      <i className="ri-check-line text-lg mr-2 text-green-500"></i>
                      <span
                        className={`font-medium ${selectedTheme === 'oscuro' ? 'text-green-300' : 'text-green-700'}`}
                      >
                        ¡Listo para reclamar puntos!
                      </span>
                    </div>

                    <button
                      onClick={handleClaimPoints}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <i className="ri-star-line text-lg"></i>
                      <span>Reclamar 5 Puntos</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-4 py-3 rounded-lg ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border mb-4`}
                >
                  <i className="ri-time-line text-lg mr-2 text-red-500"></i>
                  <div>
                    <p
                      className={`text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      Ya viste este anuncio
                    </p>
                    <p className="text-sm font-bold text-red-500">{timeUntilNextClaim}</p>
                  </div>
                </div>

                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Podrás ver este anuncio nuevamente y reclamar puntos cuando termine el tiempo de
                  espera.
                </p>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div
            className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3 mb-4`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
                Estado:
              </span>
              <span className={`font-medium ${canClaim ? 'text-green-600' : 'text-red-600'}`}>
                {canClaim ? 'Disponible' : 'Bloqueado 24h'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
                Puntos a ganar:
              </span>
              <span className={`font-medium ${canClaim ? 'text-yellow-600' : 'text-gray-500'}`}>
                {canClaim ? '5 puntos' : '0 puntos'}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer ${selectedTheme === 'oscuro' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              Cerrar
            </button>

            {adUrl && (
              <button
                onClick={() => window.open(adUrl, '_blank')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer"
              >
                Volver al Sitio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdViewPage;
