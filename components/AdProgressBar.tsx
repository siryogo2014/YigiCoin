'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AdProgressBarProps {
  adId: string;
  adTitle: string;
  onPointsClaimed: (points: number) => void;
  onClose: () => void;
}

function AdProgressBar({ adId, adTitle, onPointsClaimed, onClose }: AdProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [canClaim, setCanClaim] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [pointsClaimed, setPointsClaimed] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState<string>('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedTimeRef = useRef<number>(0);

  // Verificar si ya fue reclamado este anuncio en las últimas 24h
  useEffect(() => {
    const checkClaimStatus = () => {
      const adViews = JSON.parse(localStorage.getItem('ad_views') || '[]');
      const existingView = adViews.find(
        (view: any) => view.adId === adId && view.userId === 'current_user'
      );

      if (existingView) {
        const nextClaim = new Date(existingView.nextClaimTime);
        const now = new Date();

        if (nextClaim > now) {
          setIsAlreadyClaimed(true);
          const diff = nextClaim.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setNextClaimTime(`${hours}h ${minutes}m`);
        }
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 1000);
    return () => clearInterval(interval);
  }, [adId]);

  // Manejar visibilidad de la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsVisible(true);
        // Reanudar desde donde se quedó
        startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;
      } else {
        setIsVisible(false);
        // Guardar tiempo transcurrido
        elapsedTimeRef.current = (Date.now() - startTimeRef.current) / 1000;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Timer principal
  useEffect(() => {
    if (isAlreadyClaimed || pointsClaimed || !isVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, (now - startTimeRef.current) / 1000);
      const remaining = Math.max(0, 5 - elapsed);
      const progressPercent = Math.min(100, (elapsed / 5) * 100);

      setProgress(progressPercent);
      setTimeRemaining(Math.ceil(remaining));

      if (remaining <= 0) {
        setCanClaim(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100); // Actualizar cada 100ms para suavidad

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, isAlreadyClaimed, pointsClaimed]);

  // Reclamar puntos
  const handleClaimPoints = () => {
    if (!canClaim || pointsClaimed || isAlreadyClaimed) return;

    const now = new Date();
    const nextClaimTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar en localStorage
    const adViews = JSON.parse(localStorage.getItem('ad_views') || '[]');
    const existingViewIndex = adViews.findIndex(
      (view: any) => view.adId === adId && view.userId === 'current_user'
    );

    const newView = {
      adId,
      userId: 'current_user',
      viewedAt: now.toISOString(),
      pointsClaimed: true,
      nextClaimTime: nextClaimTime.toISOString(),
    };

    if (existingViewIndex >= 0) {
      adViews[existingViewIndex] = newView;
    } else {
      adViews.push(newView);
    }

    localStorage.setItem('ad_views', JSON.stringify(adViews));

    // Actualizar puntos del usuario
    const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
    userData.points = (userData.points || 0) + 5;
    localStorage.setItem('user_simulation_data', JSON.stringify(userData));

    setPointsClaimed(true);
    onPointsClaimed(5);

    // Auto-cerrar después de 2 segundos
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isVisible && !canClaim && !pointsClaimed) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-3 px-4 z-50 shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <i className="ri-pause-circle-line text-lg animate-pulse"></i>
          <span className="font-medium">Timer pausado - Vuelve a esta pestaña para continuar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
      {/* Barra de progreso */}
      <div className="h-2 bg-gray-200 relative overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            canClaim
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-blue-400 to-purple-500'
          }`}
          style={{ width: `${progress}%` }}
        >
          {canClaim && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Contenido de la barra */}
      <div
        className={`${
          canClaim && !pointsClaimed && !isAlreadyClaimed
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : isAlreadyClaimed
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : pointsClaimed
                ? 'bg-gradient-to-r from-green-600 to-emerald-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
        } text-white py-3 px-4`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Información del anuncio */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <i
                className={`text-lg ${
                  canClaim && !pointsClaimed && !isAlreadyClaimed
                    ? 'ri-star-line animate-bounce'
                    : isAlreadyClaimed
                      ? 'ri-time-line'
                      : pointsClaimed
                        ? 'ri-check-circle-line'
                        : 'ri-eye-line'
                }`}
              ></i>
              <span className="font-medium text-sm sm:text-base">
                {isAlreadyClaimed
                  ? `Ya viste este anuncio - Disponible en ${nextClaimTime}`
                  : pointsClaimed
                    ? '¡5 puntos reclamados exitosamente!'
                    : canClaim
                      ? '¡Puedes reclamar tus 5 puntos!'
                      : `Viendo anuncio... ${timeRemaining.toFixed(1)}s`}
              </span>
            </div>
            <div className="hidden sm:block text-sm opacity-80">{adTitle}</div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {/* Botón de reclamar */}
            {canClaim && !pointsClaimed && !isAlreadyClaimed && (
              <button
                onClick={handleClaimPoints}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-50 transition-all flex items-center space-x-2 shadow-md border border-green-200 animate-pulse"
              >
                <i className="ri-star-fill text-yellow-500"></i>
                <span>Reclamar 5 Puntos</span>
              </button>
            )}

            {/* Mostrar progreso visual */}
            {!canClaim && !isAlreadyClaimed && !pointsClaimed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-2xl font-bold">{timeRemaining}</span>
              </div>
            )}

            {/* Estado de puntos reclamados */}
            {pointsClaimed && (
              <div className="flex items-center space-x-2">
                <i className="ri-check-circle-fill text-white text-xl"></i>
                <span className="font-bold">+5 puntos</span>
              </div>
            )}

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Cerrar"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de visibilidad para debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-black/20 text-white text-xs px-2 py-1 text-center">
          Debug: Visible={isVisible.toString()} | Progress={progress.toFixed(1)}% | CanClaim=
          {canClaim.toString()}
        </div>
      )}
    </div>
  );
}

export default AdProgressBar;
