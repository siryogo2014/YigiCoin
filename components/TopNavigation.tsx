'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CurrentUserLevel {
  current: {
    id: number;
    name: string;
    price: number;
    balance: number;
  };
  next: {
    id: number;
    name: string;
    price: number;
  };
}

interface TopNavigationProps {
  timer: number;
  isPageBlocked: boolean;
  resetTimer: () => void;
  updateTimer: () => void;
  setShowTimerModal: (show: boolean) => void;
  setShowInfoModal: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  notificacionesPendientes: number;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  currentUserLevel: CurrentUserLevel;
  onShowAccountModal: () => void;
  updateButtonCooldown?: number;
  isUpdateButtonDisabled?: boolean;
  selectedTheme?: string;
}

function TopNavigation({
  timer = 0,
  isPageBlocked = false,
  resetTimer,
  updateTimer,
  setShowTimerModal,
  setShowInfoModal,
  setActiveTab,
  notificacionesPendientes = 0,
  showUserMenu = false,
  setShowUserMenu,
  currentUserLevel,
  onShowAccountModal,
  updateButtonCooldown = 0,
  isUpdateButtonDisabled = false,
  selectedTheme = 'claro',
}: TopNavigationProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    setMounted(true);
    loadUserPoints();

    // Actualizar puntos cuando cambie el localStorage
    const interval = setInterval(loadUserPoints, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUserPoints = () => {
    const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
    setUserPoints(userData.points || 0);
  };

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
      setShowTimerModal(true);
    }
  };

  const handleInfoClick = (): void => {
    if (!isPageBlocked && typeof setShowInfoModal === 'function') {
      setShowInfoModal(true);
    }
  };

  const handleNotificationsClick = (): void => {
    if (!isPageBlocked && typeof setActiveTab === 'function') {
      setActiveTab('notificaciones');
    }
  };

  const handleUserMenuToggle = (): void => {
    if (!isPageBlocked && typeof setShowUserMenu === 'function') {
      setShowUserMenu(!showUserMenu);
    }
  };

  const handleConfigClick = (): void => {
    if (typeof onShowAccountModal === 'function') {
      onShowAccountModal();
    }
    if (typeof setShowUserMenu === 'function') {
      setShowUserMenu(false);
    }
  };

  const handleLogout = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    }
  };

  const currentLevel = currentUserLevel?.current || { name: 'Registrado' };

  return (
    <nav
      className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b sticky top-0 z-40 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 overflow-visible">
        <div className="flex items-center justify-between overflow-visible">
          {/* Logo y marca */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base font-[`Pacifico`]">Y</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-blue-600 font-[`Pacifico`] hidden sm:block">
              YigiCoin
            </h1>
          </div>

          {/* Sección central - Stats del usuario */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Balance */}
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'} border rounded-lg px-3 py-1`}
            >
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Saldo
                </p>
                <p className="text-sm font-bold text-green-600">
                  ${currentUserLevel?.current?.balance || 0} USD
                </p>
              </div>
            </div>

            {/* Mostrar puntos del usuario */}
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'} border rounded-lg px-3 py-1`}
            >
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Puntos
                </p>
                <p className="text-sm font-bold text-yellow-600">
                  <i className="ri-star-line mr-1"></i>
                  {userPoints}
                </p>
              </div>
            </div>

            {/* Nivel actual */}
            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border rounded-lg px-3 py-1`}
            >
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Nivel
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {currentUserLevel?.current?.name || 'Registrado'}
                </p>
              </div>
            </div>
          </div>

          {/* Timer Section - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 justify-center px-2 overflow-visible">
            <div
              className={`flex items-center space-x-1 sm:space-x-2 ${selectedTheme === 'oscuro' ? 'bg-gray-700' : 'bg-blue-100'} px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg`}
            >
              <i
                className={`ri-time-line text-sm sm:text-base lg:text-lg ${selectedTheme === 'oscuro' ? 'text-blue-400' : 'text-blue-600'}`}
              ></i>
              <div className="text-center">
                <p
                  className={`text-xs font-medium hidden sm:block ${selectedTheme === 'oscuro' ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  Tiempo restante
                </p>
                <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600">
                  {formatTimer(timer)}
                </div>
              </div>
            </div>

            {/* Add Time Button - Responsive */}
            <button
              onClick={handleTimerModalClick}
              disabled={timer === 0 || isPageBlocked}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                timer > 0 && !isPageBlocked
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="ri-add-line text-sm sm:text-base"></i>
            </button>

            {/* Info Button - Responsive */}
            <button
              onClick={handleInfoClick}
              disabled={isPageBlocked}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isPageBlocked
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              <i className="ri-information-line text-sm sm:text-base"></i>
            </button>
          </div>

          {/* User Actions - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Notifications Button */}
            <button
              onClick={handleNotificationsClick}
              disabled={isPageBlocked}
              className={`relative p-1.5 sm:p-2 transition-colors ${
                isPageBlocked
                  ? 'text-gray-400 cursor-not-allowed'
                  : selectedTheme === 'oscuro'
                    ? 'text-gray-300 hover:text-white cursor-pointer'
                    : 'text-gray-600 hover:text-gray-800 cursor-pointer'
              }`}
            >
              <i className="ri-notification-3-line text-lg sm:text-xl lg:text-2xl"></i>
              {notificacionesPendientes > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                  {notificacionesPendientes}
                </span>
              )}
            </button>

            {/* User Menu - Responsive */}
            <div className="relative user-menu">
              <button
                onClick={handleUserMenuToggle}
                disabled={isPageBlocked}
                className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm transition-colors ${
                  isPageBlocked
                    ? 'text-gray-400 cursor-not-allowed'
                    : selectedTheme === 'oscuro'
                      ? 'text-gray-300 hover:text-white cursor-pointer'
                      : 'text-gray-600 hover:text-gray-800 cursor-pointer'
                }`}
              >
                <i className="ri-user-line text-base sm:text-lg"></i>
                <span className="hidden sm:inline">usuario123</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                  {currentLevel.name}
                </span>
                <i className="ri-arrow-down-s-line hidden sm:inline"></i>
              </button>

              {/* User Menu Dropdown - Responsive */}
              {showUserMenu && !isPageBlocked && (
                <div
                  className={`absolute right-0 top-full mt-2 w-44 sm:w-48 ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}
                >
                  <button
                    onClick={handleConfigClick}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-sm cursor-pointer flex items-center ${
                      selectedTheme === 'oscuro'
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-settings-line mr-2"></i>
                    <span className="truncate">Configurar cuenta</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-sm cursor-pointer flex items-center ${
                      selectedTheme === 'oscuro'
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-logout-box-line mr-2"></i>
                    <span className="truncate">Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNavigation;
