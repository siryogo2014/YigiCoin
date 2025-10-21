'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PanelDeControl from '../components/PanelDeControl';
import ContadorUsuario from '../components/ContadorUsuario';
import SeccionReferidos from '../components/SeccionReferidos';
import NavigationTabs from '../components/NavigationTabs';
import TopNavigation from '../components/TopNavigation';
import ModalPago from '../components/ModalPago';
import AccountModal from '../components/modals/AccountModal';
import SuspendedAccountModal from '../components/modals/SuspendedAccountModal';
import FloatingTimer from '../components/modals/FloatingTimer';
import SupportChat from '../components/modals/SupportChat';
import BeneficiosSection from '../components/BeneficiosSection';
import PublicidadSection from '../components/PublicidadSection';

import { useTimer } from '../hooks/useTimer';
import { useModals } from '../hooks/useModals';
import { useReferralLinks } from '../hooks/useReferralLinks';
import { useSimulation } from '../hooks/useSimulation';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('oficina');
  const [timePeriod, setTimePeriod] = useState('mensual');
  const [mounted, setMounted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('claro');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{ rank: string; name: string } | null>(
    null
  );
  const [highlightedTabs, setHighlightedTabs] = useState<string[]>([]);
  const router = useRouter();

  const [promotorMessage, setPromotorMessage] = useState('');
  const [isEditingPromotorMessage, setIsEditingPromotorMessage] = useState(false);

  const {
    simulationState,
    upgradeToRank,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getCurrentRankData,
    getNextRankData,
    canUpgrade,
    useTotem,
    // NUEVO: Funciones para usar puntos
    usePointsForTimeExtension,
    usePointsForTimerUpdate,
    simulatePaymentSuccess,
    RANKS,
    mounted: simulationMounted,
  } = useSimulation();

  const currentRankData = getCurrentRankData();
  const nextRankData = getNextRankData();

  const timerDuration =
    currentRankData?.timerDuration === -1 ? -1 : currentRankData?.timerDuration || 180;
  const timerState = useTimer(timerDuration);
  const modalState = useModals();
  const referralLinks = useReferralLinks();

  useEffect(() => {
    setMounted(true);

    const userData = localStorage.getItem('user_simulation_data');

    if (!userData) {
      const defaultUserData = {
        id: `user_${Date.now()}`,
        name: 'Usuario Demo',
        email: 'demo@yigicoin.com',
        username: 'demo_user',
        phone: '+1-555-0123',
        gender: 'No especificado',
        currentRank: 'registrado',
        balance: 6,
        referralCount: 2,
        hasCompletedRegistration: true,
        registrationDate: new Date().toISOString(),
      };

      const initialNotifications = [
        {
          id: 1,
          type: 'payment',
          title: 'Pago Recibido',
          message: 'Has recibido un pago de $3 por referido - Usuario 1',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          read: false,
          icon: 'ri-money-dollar-circle-line',
          color: 'green',
        },
        {
          id: 2,
          type: 'payment',
          title: 'Pago Recibido',
          message: 'Has recibido un pago de $3 por referido - Usuario 2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          read: false,
          icon: 'ri-money-dollar-circle-line',
          color: 'green',
        },
        {
          id: 3,
          type: 'referral',
          title: 'Nuevos Referidos',
          message: '2 usuarios se registraron usando tus enlaces',
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-user-add-line',
          color: 'blue',
        },
      ];

      const initialTransactions = [
        {
          id: 1,
          tipo: 'Ingreso',
          descripcion: 'Pago por referido - Usuario 1',
          monto: 3,
          fecha: new Date(Date.now() - 120000).toISOString().split('T')[0],
          estado: 'Completado',
        },
        {
          id: 2,
          tipo: 'Ingreso',
          descripcion: 'Pago por referido - Usuario 2',
          monto: 3,
          fecha: new Date(Date.now() - 60000).toISOString().split('T')[0],
          estado: 'Completado',
        },
      ];

      localStorage.setItem('user_simulation_data', JSON.stringify(defaultUserData));
      localStorage.setItem('simulation_notifications', JSON.stringify(initialNotifications));
      localStorage.setItem('simulation_transactions', JSON.stringify(initialTransactions));
    } else {
      try {
        const parsedData = JSON.parse(userData);

        if (!parsedData.hasCompletedRegistration) {
          parsedData.hasCompletedRegistration = true;
          parsedData.balance = parsedData.balance || 6;
          parsedData.referralCount = parsedData.referralCount || 2;
          localStorage.setItem('user_simulation_data', JSON.stringify(parsedData));
        }
      } catch (error) {
        const defaultUserData = {
          id: `user_${Date.now()}`,
          name: 'Usuario Demo',
          email: 'demo@yigicoin.com',
          username: 'demo_user',
          phone: '+1-555-0123',
          gender: 'No especificado',
          currentRank: 'registrado',
          balance: 6,
          referralCount: 2,
          hasCompletedRegistration: true,
          registrationDate: new Date().toISOString(),
        };
        localStorage.setItem('user_simulation_data', JSON.stringify(defaultUserData));
      }
    }

    const savedTheme = localStorage.getItem('selected_theme') || 'claro';
    setSelectedTheme(savedTheme);

    const highlightedTabsData = localStorage.getItem('highlighted_tabs');
    if (highlightedTabsData) {
      try {
        setHighlightedTabs(JSON.parse(highlightedTabsData));
      } catch (error) {
        console.error('Error loading highlighted tabs:', error);
      }
    }
  }, [router]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    localStorage.setItem('selected_theme', theme);

    setTimeout(() => {
      window.dispatchEvent(new Event('themeChanged'));
    }, 100);
  };

  const removeTabHighlight = (tabId: string) => {
    const newHighlightedTabs = highlightedTabs.filter((tab) => tab !== tabId);
    setHighlightedTabs(newHighlightedTabs);
    localStorage.setItem('highlighted_tabs', JSON.stringify(newHighlightedTabs));
  };

  const currentUserLevel = useMemo(
    () => ({
      current: {
        id:
          simulationState.currentRank === 'registrado'
            ? 1
            : simulationState.currentRank === 'invitado'
              ? 2
              : simulationState.currentRank === 'basico'
                ? 3
                : simulationState.currentRank === 'vip'
                  ? 4
                  : simulationState.currentRank === 'premium'
                    ? 5
                    : 6,
        name: currentRankData?.name || 'Registrado',
        price: currentRankData?.price || 3,
        balance: (simulationState?.balance ?? 0),
      },
      next: {
        id: nextRankData
          ? nextRankData.id === 'invitado'
            ? 2
            : nextRankData.id === 'basico'
              ? 3
              : nextRankData.id === 'vip'
                ? 4
                : nextRankData.id === 'premium'
                  ? 5
                  : 6
          : 7,
        name: nextRankData?.name || 'Elite',
        price: nextRankData?.price || 0,
      },
    }),
    [simulationState.currentRank, currentRankData, nextRankData]
  );

  const levels = useMemo(
    () => [
      { id: 1, name: 'Registrado', price: 3, descripcion: 'Nivel inicial después del registro.' },
      {
        id: 2,
        name: 'Invitado',
        price: 5,
        descripcion: 'Primer nivel activo con acceso mejorado.',
      },
      { id: 3, name: 'Básico', price: 10, descripcion: 'Acceso a recursos adicionales.' },
      {
        id: 4,
        name: 'VIP',
        price: 50,
        descripcion: 'Miembro activo con acceso a comunidad exclusiva.',
      },
      {
        id: 5,
        name: 'Premium',
        price: 400,
        descripcion: 'Líder de comunidad con herramientas avanzadas.',
      },
      { id: 6, name: 'Elite', price: 6000, descripcion: 'Nivel premium con todos los beneficios.' },
    ],
    []
  );

  const transacciones = useMemo(() => {
    return simulationState.transactionHistory.length > 0
      ? simulationState.transactionHistory
      : [
        {
          id: 1,
          tipo: 'Ingreso',
          descripcion: 'Balance inicial - 2 referidos',
          monto: 6,
          fecha: '2024-01-15',
          estado: 'Completado',
        },
      ];
  }, [simulationState.transactionHistory]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'oficina', label: 'Principal', icon: 'ri-home-line' },
      { id: 'ascender', label: 'Ascender', icon: 'ri-arrow-up-line' },
      { id: 'referidos', label: 'Referidos', icon: 'ri-group-line' },
      { id: 'promotor', label: 'Promotor', icon: 'ri-star-line' },
      { id: 'explicacion', label: 'Explicación', icon: 'ri-information-line' },
      { id: 'notificaciones', label: 'Notificaciones', icon: 'ri-notification-3-line' },
      { id: 'configuracion', label: 'Configuración', icon: 'ri-settings-line' },
    ];

    const additionalTabs = [];

    if (simulationState.availableTabs.includes('balance')) {
      additionalTabs.push({ id: 'balance', label: 'Balance', icon: 'ri-wallet-line' });
    }
    if (simulationState.availableTabs.includes('niveles')) {
      additionalTabs.push({ id: 'niveles', label: 'Niveles', icon: 'ri-bar-chart-line' });
    }
    if (simulationState.availableTabs.includes('beneficios')) {
      additionalTabs.push({ id: 'beneficios', label: 'Beneficios', icon: 'ri-gift-line' });
    }
    if (simulationState.availableTabs.includes('panel')) {
      additionalTabs.push({ id: 'panel', label: 'Panel', icon: 'ri-dashboard-line' });
    }
    if (simulationState.availableTabs.includes('publicidad')) {
      additionalTabs.push({ id: 'publicidad', label: 'Publicidad', icon: 'ri-advertisement-line' });
    }

    let finalTabs = [...baseTabs];

    if (additionalTabs.some((t) => t.id === 'panel')) {
      finalTabs.splice(2, 0, { id: 'panel', label: 'Panel', icon: 'ri-dashboard-line' });
    }
    if (additionalTabs.some((t) => t.id === 'balance')) {
      finalTabs.splice(-2, 0, { id: 'balance', label: 'Balance', icon: 'ri-wallet-line' });
    }
    if (additionalTabs.some((t) => t.id === 'niveles')) {
      finalTabs.splice(-2, 0, { id: 'niveles', label: 'Niveles', icon: 'ri-bar-chart-line' });
    }
    if (additionalTabs.some((t) => t.id === 'beneficios')) {
      finalTabs.splice(-2, 0, { id: 'beneficios', label: 'Beneficios', icon: 'ri-gift-line' });
    }
    if (additionalTabs.some((t) => t.id === 'publicidad')) {
      const promotorIndex = finalTabs.findIndex((tab) => tab.id === 'promotor');
      if (promotorIndex !== -1) {
        finalTabs.splice(promotorIndex + 1, 0, {
          id: 'publicidad',
          label: 'Publicidad',
          icon: 'ri-advertisement-line',
        });
      }
    }

    return finalTabs;
  }, [simulationState.availableTabs]);

  useEffect(() => {
    if (!mounted) return;

    const savedPromotorMessage = localStorage.getItem('promotor_message_usuario123');
    if (savedPromotorMessage) {
      setPromotorMessage(savedPromotorMessage);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || simulationState.currentRank === 'elite') return;

    if (timerState.isPageBlocked && timerState.timer === 0) {
      setActiveTab('oficina');
      const timeout = setTimeout(() => {
        modalState.openModal('showZeroTimeModal');
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [
    mounted,
    timerState.isPageBlocked,
    timerState.timer,
    modalState,
    simulationState.currentRank,
  ]);

  useEffect(() => {
    if (activeTab === 'configuracion') {
      modalState.openModal('showAccountModal');
      setActiveTab('oficina');
    }
  }, [activeTab, modalState]);

  useEffect(() => {
    if (timerState.isPageBlocked && simulationState.totemCount > 0) {
      const timeout = setTimeout(() => {
        if (useTotem()) {
          timerState.resetTimer();
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [timerState.isPageBlocked, simulationState.totemCount, useTotem, timerState]);

  const handleTimePackageSelect = (packageType: string) => {
    modalState.setSelectedTimePackage(packageType);
    modalState.closeModal('showTimerModal');
    modalState.openModal('showTimePaymentModal');
  };

  const handlePenaltyPayment = () => {
    modalState.closeModal('showZeroTimeModal');
    modalState.openModal('showPenaltyPaymentModal');
  };

  const handleTabChange = (tab: string) => {
    if (simulationState.currentRank !== 'elite' && timerState.isPageBlocked) {
      return;
    }

    if (highlightedTabs.includes(tab)) {
      removeTabHighlight(tab);
    }

    setActiveTab(tab);
  };

  const handleUpgrade = () => {
    if (canUpgrade() && nextRankData) {
      const success = upgradeToRank(nextRankData.id);
      if (success) {
        setUpgradeModalData({
          rank: nextRankData.id,
          name: nextRankData.name,
        });

        setShowUpgradeModal(true);

        setTimeout(() => {
          const modalElement = document.querySelector('.upgrade-modal-animated');
          if (modalElement) {
            modalElement.classList.remove('animate-bounce');
            modalElement.classList.add('animate-diminishing-bounce');
          }
        }, 100);

        const previousTabs = tabs.map((t) => t.id);

        setTimeout(() => {
          const newAvailableTabs = getAvailableTabsForRank(nextRankData.id);
          const newTabs = newAvailableTabs.filter(
            (tabId) =>
              !previousTabs.includes(tabId) &&
              ['balance', 'niveles', 'beneficios', 'panel', 'publicidad'].includes(tabId)
          );

          if (newTabs.length > 0) {
            const updatedHighlighted = [...highlightedTabs, ...newTabs];
            setHighlightedTabs(updatedHighlighted);
            localStorage.setItem('highlighted_tabs', JSON.stringify(updatedHighlighted));
          }
        }, 100);

        if (nextRankData.timerDuration !== -1) {
          timerState.resetTimer();
        }
      }
    }
  };

  const handleTimeExtensionPayment = (details: any) => {
    simulatePaymentSuccess('tiempo', details.amount);
    modalState.closeModal('showTimePaymentModal');

    const additionalSeconds = modalState.selectedTimePackage === '2usd' ? 172800 : 360000;
    timerState.addTime(additionalSeconds);

    modalState.setSelectedTimePackage(null);
  };

  const getAvailableTabsForRank = (rank: string): string[] => {
    const baseTabs = [
      'oficina',
      'ascender',
      'referidos',
      'promotor',
      'explicacion',
      'notificaciones',
      'configuracion',
    ];

    switch (rank) {
      case 'registrado':
        return baseTabs;
      case 'invitado':
        return [...baseTabs, 'balance'];
      case 'basico':
        return [...baseTabs, 'balance', 'niveles', 'beneficios'];
      case 'vip':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'panel'];
      case 'premium':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'panel'];
      case 'elite':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'panel'];
      default:
        return baseTabs;
    }
  };

  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false);
    setActiveTab('oficina');
  };

  const handleEditPromotorMessage = () => {
    setIsEditingPromotorMessage(true);
  };

  const handleSavePromotorMessage = () => {
    localStorage.setItem('promotor_message_usuario123', promotorMessage);
    setIsEditingPromotorMessage(false);
  };

  const handleCancelPromotorMessage = () => {
    setIsEditingPromotorMessage(false);
    const savedMessage = localStorage.getItem('promotor_message_usuario123') || '';
    setPromotorMessage(savedMessage);
  };

  const getPromotorMessageForUser = () => {
    const promotorId = 'promotor456';
    const message = localStorage.getItem(`promotor_message_${promotorId}`);
    return message || 'Tu promotor aún no ha dejado un mensaje personalizado para ti.';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'oficina':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 relative">
                <img
                  src="https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/7fa7eb9e54974d7cf5c94535444db357.jfif"
                  alt="Fondo YigiCoin"
                  className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-full absolute inset-0"
                />
                <img
                  src="https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/a843437a18888ba7a9ccb0aa69eab34d.png"
                  alt="Logotipo de YigiCoin"
                  className="w-24 h-24 sm:w-36 sm:h-36 object-contain relative z-10"
                />
              </div>
              <h2
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                ¡Bienvenido a YigiCoin!
              </h2>
              <p
                className={`text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Tu plataforma de crecimiento y oportunidades. Aquí podrás gestionar tu cuenta,
                ascender de nivel y maximizar tus ganancias.
              </p>

              <div
                className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-gray-800 to-gray-700 border-gray-600' : 'from-blue-50 to-purple-50 border-blue-200'} border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-2xl mx-auto`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {currentUserLevel.current.id}
                    </span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3
                      className={`text-base sm:text-lg font-semibold mb-1 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      Tu Rango Actual
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {currentUserLevel.current.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center mb-4">
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'} rounded-lg p-3 border`}
                  >
                    <p
                      className={`text-xs sm:text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Nivel
                    </p>
                    <p className="text-base sm:text-lg font-bold text-blue-600">
                      {currentUserLevel.current.id}
                    </p>
                  </div>
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'} rounded-lg p-3 border`}
                  >
                    <p
                      className={`text-xs sm:text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Balance
                    </p>
                    <p className="text-base sm:text-lg font-bold text-green-600">
                      ${simulationState.balance} USD
                    </p>
                  </div>
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'} rounded-lg p-3 border`}
                  >
                    <p
                      className={`text-xs sm:text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Siguiente
                    </p>
                    <p className="text-base sm:text-lg font-bold text-purple-600">
                      {nextRankData?.name || 'Elite Max'}
                    </p>
                  </div>
                </div>
                {nextRankData && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => !timerState.isPageBlocked && setActiveTab('ascender')}
                      disabled={simulationState.currentRank !== 'elite' && timerState.isPageBlocked}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${simulationState.currentRank !== 'elite' && timerState.isPageBlocked
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer'
                        }`}
                    >
                      Ascender a {nextRankData.name}
                    </button>
                  </div>
                )}
              </div>

              {/* Selector de tema */}
              {simulationState.currentRank === 'basico' ||
                simulationState.currentRank === 'vip' ||
                simulationState.currentRank === 'premium' ||
                simulationState.currentRank === 'elite' ? (
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-4 mb-6 max-w-md mx-auto`}
                >
                  <h3
                    className={`text-base font-semibold mb-3 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                  >
                    <i className="ri-palette-line mr-2"></i>
                    Tema de la Página
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleThemeChange('claro')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${selectedTheme === 'claro'
                          ? 'bg-blue-600 text-white'
                          : selectedTheme === 'oscuro'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <i className="ri-sun-line mr-1"></i>
                      Claro
                    </button>
                    <button
                      onClick={() => handleThemeChange('oscuro')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${selectedTheme === 'oscuro'
                          ? 'bg-blue-600 text-white'
                          : selectedTheme === 'oscuro'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <i className="ri-moon-line mr-1"></i>
                      Oscuro
                    </button>
                  </div>
                </div>
              ) : null}

              {simulationState.currentRank !== 'elite' && (
                <ContadorUsuario
                  timer={timerState.timer}
                  isPageBlocked={timerState.isPageBlocked}
                  resetTimer={timerState.resetTimer}
                  updateTimer={timerState.updateTimer}
                  setShowTimerModal={() => modalState.openModal('showTimerModal')}
                  setShowInfoModal={() => modalState.openModal('showInfoModal')}
                  updateButtonCooldown={timerState.updateButtonCooldown}
                  isUpdateButtonDisabled={timerState.isUpdateButtonDisabled}
                />
              )}
            </div>
          </div>
        );

      case 'ascender':
        return (
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            <h2
              className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Ascender de Nivel
            </h2>

            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 to-gray-700 border-gray-600' : 'from-blue-50 to-purple-50 border-blue-200'} rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {currentUserLevel.current.id}
                    </span>
                  </div>
                  <h3
                    className={`font-semibold mb-1 text-sm sm:text-base ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                  >
                    Nivel Actual
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-blue-600">
                    {currentUserLevel.current.name}
                  </p>
                  <p
                    className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Balance: ${simulationState.balance} USD
                  </p>
                </div>
                {nextRankData && (
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg sm:text-xl">
                        {currentUserLevel.next.id}
                      </span>
                    </div>
                    <h3
                      className={`font-semibold mb-1 text-sm sm:text-base ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      Próximo Nivel
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-green-600">
                      {nextRankData.name}
                    </p>
                    <p
                      className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Costo: ${nextRankData.price} USD
                    </p>
                  </div>
                )}
              </div>
              {nextRankData && (
                <div className="text-center mt-4 sm:mt-6">
                  <button
                    onClick={handleUpgrade}
                    disabled={!canUpgrade()}
                    className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm sm:text-base ${canUpgrade()
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                  >
                    <i className="ri-arrow-up-line text-lg sm:text-xl"></i>
                    <span>
                      {canUpgrade()
                        ? `Ascender a ${nextRankData.name} - $${nextRankData.price} USD`
                        : 'Balance insuficiente'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden">
              <img
                src="https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/e935b2a4b8483396f124461c6e9dd7ff.jfif"
                alt="Crecimiento económico"
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 flex items-center justify-center">
                <div className="text-center text-white px-4 sm:px-6">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-shadow-lg">
                    Tu Crecimiento No Tiene Límites
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto text-shadow-md">
                    Cada nivel que alcances es una semilla que plantas para tu futuro financiero.
                    <br className="hidden sm:block" />
                    El éxito no es casualidad, es el resultado de tu dedicación y visión.
                    <br className="hidden sm:block" />
                    <span className="font-semibold text-yellow-300 block mt-2 sm:inline sm:mt-0">
                      ¡Hoy es el día perfecto para dar el siguiente paso hacia tu independencia
                      económica!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'referidos':
        return (
          <SeccionReferidos
            referidos={[]}
            promotorMessage={promotorMessage}
            setPromotorMessage={setPromotorMessage}
            isEditingPromotorMessage={isEditingPromotorMessage}
            setIsEditingPromotorMessage={setIsEditingPromotorMessage}
            handleEditPromotorMessage={handleEditPromotorMessage}
            handleSavePromotorMessage={handleSavePromotorMessage}
            handleCancelPromotorMessage={handleCancelPromotorMessage}
            selectedTheme={selectedTheme}
          />
        );

      case 'panel':
        return (
          <PanelDeControl
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            referidos={[]}
            setActiveTab={handleTabChange}
            selectedTheme={selectedTheme}
          />
        );

      case 'balance':
        return (
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="ri-wallet-3-line text-2xl sm:text-3xl text-white"></i>
              </div>
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                Mi Balance
              </h2>
              <p
                className={`text-sm sm:text-base ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Resumen completo de tus ingresos y transacciones
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl"></div>
              <div
                className={`absolute inset-[2px] rounded-2xl ${selectedTheme === 'oscuro' ? 'bg-gray-800' : 'bg-white'}`}
              ></div>
              <div
                className={`relative bg-gradient-to-br ${selectedTheme === 'oscuro' ? 'from-gray-800 via-gray-700 to-gray-800' : 'from-green-50 via-blue-50 to-purple-50'} rounded-2xl p-4 sm:p-6 lg:p-8 text-center`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 sm:mb-6 shadow-lg">
                  <i className="ri-money-dollar-circle-fill text-xl sm:text-2xl text-white"></i>
                </div>
                <p
                  className={`text-base sm:text-lg font-medium mb-2 sm:mb-3 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Balance Total Acumulado
                </p>
                <div className="mb-4">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ${simulationState.balance.toLocaleString()}
                  </p>
                  <p
                    className={`text-lg sm:text-xl font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    USD
                  </p>
                </div>

                {/* Mostrar ingresos por rango actual */}
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-700/80 border-gray-600' : 'bg-white/80 border-blue-100'} rounded-xl p-4 mb-6 border`}
                >
                  <h4
                    className={`text-sm sm:text-base font-semibold mb-3 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                  >
                    Ingresos Nivel {currentRankData?.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div
                      className={`${selectedTheme === 'oscuro' ? 'bg-green-800/30' : 'bg-green-50'} rounded-lg p-2 sm:p-3`}
                    >
                      <p
                        className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Referidos
                      </p>
                      <p className="text-base sm:text-lg font-bold text-green-600">
                        {simulationState.referralCount}
                      </p>
                    </div>
                    <div
                      className={`${selectedTheme === 'oscuro' ? 'bg-blue-800/30' : 'bg-blue-50'} rounded-lg p-2 sm:p-3`}
                    >
                      <p
                        className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Precio/Ref.
                      </p>
                      <p className="text-base sm:text-lg font-bold text-blue-600">
                        ${currentRankData?.price}
                      </p>
                    </div>
                    <div
                      className={`${selectedTheme === 'oscuro' ? 'bg-purple-800/30' : 'bg-purple-50'} rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-1`}
                    >
                      <p
                        className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Total Generado
                      </p>
                      <p className="text-base sm:text-lg font-bold text-purple-600">
                        ${currentRankData?.expectedIncome.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${selectedTheme === 'oscuro' ? 'bg-green-800' : 'bg-green-100'}`}
                    >
                      <i className="ri-trending-up-line text-green-600 text-lg sm:text-xl"></i>
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Referidos
                    </p>
                    <p className="text-base sm:text-lg font-bold text-green-600">
                      {simulationState.referralCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${selectedTheme === 'oscuro' ? 'bg-blue-800' : 'bg-blue-100'}`}
                    >
                      <i className="ri-group-line text-blue-600 text-lg sm:text-xl"></i>
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Red Total
                    </p>
                    <p className="text-base sm:text-lg font-bold text-blue-600">
                      {simulationState.totalNetwork}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${selectedTheme === 'oscuro' ? 'bg-purple-800' : 'bg-purple-100'}`}
                    >
                      <i className="ri-star-line text-purple-600 text-lg sm:text-xl"></i>
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Nivel
                    </p>
                    <p className="text-base sm:text-lg font-bold text-purple-600">
                      {currentRankData?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
            >
              <h3
                className={`text-lg sm:text-xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                Historial de Transacciones
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr
                      className={`${selectedTheme === 'oscuro' ? 'border-b-2 border-gray-600' : 'border-b-2 border-gray-200'}`}
                    >
                      <th
                        className={`text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Fecha
                      </th>
                      <th
                        className={`text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Tipo
                      </th>
                      <th
                        className={`text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Descripción
                      </th>
                      <th
                        className={`text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.slice(0, 10).map((transaccion) => (
                      <tr
                        key={transaccion.id}
                        className={`border-b transition-all duration-200 ${selectedTheme === 'oscuro' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'}`}
                      >
                        <td
                          className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-gray-200' : 'text-gray-800'}`}
                        >
                          {transaccion.fecha}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${transaccion.tipo === 'Ingreso'
                                ? selectedTheme === 'oscuro'
                                  ? 'bg-green-800 text-green-200'
                                  : 'bg-green-100 text-green-800'
                                : selectedTheme === 'oscuro'
                                  ? 'bg-red-800 text-red-200'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {transaccion.tipo}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-gray-200' : 'text-gray-800'}`}
                        >
                          {transaccion.descripcion}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`text-sm sm:text-lg font-bold ${transaccion.monto > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                          >
                            {transaccion.monto > 0 ? '+' : '-'}$
                            {Math.abs(transaccion.monto).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen de ingresos por rango */}
              <div
                className={`mt-6 bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-blue-900/30 to-purple-900/30 border-blue-600' : 'from-blue-50 to-purple-50 border-blue-200'} rounded-lg p-4 border`}
              >
                <h4
                  className={`font-semibold mb-3 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Proyección de Ingresos por Rango
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 text-center">
                  {Object.entries(RANKS).map(([key, rank]) => {
                    const isCurrentOrPassed =
                      simulationState.currentRank === key ||
                      Object.keys(RANKS).indexOf(simulationState.currentRank) >
                      Object.keys(RANKS).indexOf(key);

                    return (
                      <div
                        key={key}
                        className={`rounded-lg p-2 sm:p-3 border ${isCurrentOrPassed
                            ? selectedTheme === 'oscuro'
                              ? 'bg-green-800/30 border-green-600'
                              : 'bg-green-100 border-green-300'
                            : selectedTheme === 'oscuro'
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <p
                          className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {rank.name}
                        </p>
                        <p
                          className={`text-sm sm:text-base font-bold ${isCurrentOrPassed
                              ? 'text-green-600'
                              : selectedTheme === 'oscuro'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                        >
                          ${rank.expectedIncome.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {rank.maxReferrals} refs
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'beneficios':
        return (
          <BeneficiosSection
            currentRank={currentRankData?.name || 'Registrado'}
            digitalBooks={simulationState.digitalBooks}
            lotteries={simulationState.lotteries}
            selectedTheme={selectedTheme}
          />
        );

      case 'promotor':
        return (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Panel de Promotor
            </h2>

            <div
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-8 max-w-4xl mx-auto`}
            >
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <i className="ri-user-star-line text-3xl text-white"></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="ri-vip-crown-line text-white text-sm"></i>
                  </div>
                </div>
                <h3
                  className={`text-2xl font-bold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Carlos Mendoza
                </h3>
                <div
                  className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-blue-900/30 to-purple-900/30 border-blue-600' : 'from-blue-50 to-purple-50 border-blue-200'} border rounded-lg p-4 inline-block`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{currentUserLevel.current.id}</span>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Nivel Actual
                      </p>
                      <p className="text-lg font-bold text-green-600">{currentRankData?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4
                  className={`text-lg font-semibold mb-4 flex items-center ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  <i className="ri-message-2-line text-blue-500 mr-2"></i>
                  Mensaje de tu Promotor
                </h4>
                <div
                  className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-blue-900/30 to-purple-900/30 border-blue-600' : 'from-blue-50 to-purple-50 border-blue-200'} border rounded-lg p-6`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-user-star-line text-white text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <div
                        className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'} rounded-lg p-4 border`}
                      >
                        <p
                          className={`leading-relaxed ${selectedTheme === 'oscuro' ? 'text-gray-200' : 'text-gray-700'}`}
                        >
                          {getPromotorMessageForUser()}
                        </p>
                      </div>
                      <div
                        className={`mt-2 text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Mensaje de: Tu Promotor
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'niveles':
        return (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Sistema de Niveles
            </h2>

            <div
              className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-gray-800 to-gray-700 border-gray-600' : 'from-blue-50 to-purple-50 border-blue-200'} rounded-xl p-6 border`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-lightbulb-line text-2xl text-white"></i>
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Tu Progreso en YigiCoin
                </h3>
                <p className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
                  Cada nivel te da mayores beneficios y oportunidades de ganancia
                </p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="w-full max-w-md">
                  <div
                    className={`flex items-center justify-between text-sm mb-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <span>Nivel 1</span>
                    <span>Nivel 6</span>
                  </div>
                  <div
                    className={`w-full rounded-full h-3 ${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'}`}
                  >
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                      style={{ width: `${(currentUserLevel.current.id / 6) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium text-blue-600">
                      Nivel {currentUserLevel.current.id} - {currentRankData?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {levels.map((level) => {
                const isCurrentLevel = level.id === currentUserLevel.current.id;
                const isCompleted = level.id < currentUserLevel.current.id;
                const isNext = level.id === currentUserLevel.current.id + 1;

                return (
                  <div
                    key={level.id}
                    className={`rounded-xl border p-6 transition-all duration-300 ${isCurrentLevel
                        ? selectedTheme === 'oscuro'
                          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-600 shadow-lg'
                          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg'
                        : isCompleted
                          ? selectedTheme === 'oscuro'
                            ? 'bg-green-800/30 border-green-600'
                            : 'bg-green-100 border-green-300'
                          : selectedTheme === 'oscuro'
                            ? 'bg-gray-800 border-gray-600 hover:border-blue-600 hover:shadow-md'
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${isCurrentLevel
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                              : isCompleted
                                ? 'bg-green-500'
                                : selectedTheme === 'oscuro'
                                  ? 'bg-gray-600'
                                  : 'bg-gray-400'
                            }`}
                        >
                          {level.id}
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-semibold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                          >
                            {level.name}
                          </h3>
                          <p
                            className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            {level.descripcion}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${level.price}</p>
                        <p
                          className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          USD
                        </p>
                      </div>
                    </div>

                    {isCurrentLevel && (
                      <div className="mt-4 text-center">
                        <div
                          className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${selectedTheme === 'oscuro' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}
                        >
                          <i className="ri-star-fill mr-1"></i>
                          Tu Nivel Actual
                        </div>
                      </div>
                    )}

                    {isNext && canUpgrade() && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('ascender')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer shadow-lg"
                        >
                          <i className="ri-arrow-up-line mr-2"></i>
                          Ascender a {level.name}
                        </button>
                      </div>
                    )}

                    {level.id > currentUserLevel.current.id + 1 && (
                      <div className="mt-4 text-center">
                        <button
                          disabled
                          className={`px-6 py-2 rounded-lg cursor-not-allowed whitespace-nowrap ${selectedTheme === 'oscuro' ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'}`}
                        >
                          <i className="ri-lock-line mr-2"></i>
                          Bloqueado
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2
                className={`text-2xl font-bold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                Notificaciones
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  <i className="ri-check-double-line mr-2"></i>
                  Marcar como leídas
                </button>
              </div>
            </div>

            <div
              className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-gray-800 to-gray-700 border-gray-600' : 'from-blue-50 to-purple-50 border-blue-200'} rounded-xl p-6 border`}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-notification-3-line text-2xl text-white"></i>
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Centro de Notificaciones
                </h3>
                <p className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
                  Mantente al día con todas las actividades de tu cuenta
                </p>
                {simulationState.unreadCount > 0 && (
                  <div className="mt-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTheme === 'oscuro' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800'}`}
                    >
                      {simulationState.unreadCount} nuevas
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {simulationState.notifications.length > 0 ? (
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                  >
                    Recientes
                  </h3>
                  <div className="space-y-3">
                    {simulationState.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${notification.read
                            ? selectedTheme === 'oscuro'
                              ? 'bg-gray-700 border-gray-600 opacity-60'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                            : selectedTheme === 'oscuro'
                              ? `bg-${notification.color}-900/30 border-${notification.color}-600`
                              : `bg-${notification.color}-50 border-${notification.color}-200`
                          }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div
                          className={`w-10 h-10 bg-${notification.color}-500 rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <i className={`${notification.icon} text-white text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-medium ${notification.read ? (selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500') : selectedTheme === 'oscuro' ? 'text-gray-200' : `text-${notification.color}-800`}`}
                            >
                              {notification.title}
                            </h4>
                            <span
                              className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${notification.read ? (selectedTheme === 'oscuro' ? 'text-gray-500' : 'text-gray-400') : selectedTheme === 'oscuro' ? 'text-gray-300' : `text-${notification.color}-700`}`}
                          >
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-8 text-center`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedTheme === 'oscuro' ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    <i
                      className={`ri-notification-off-line text-2xl ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-400'}`}
                    ></i>
                  </div>
                  <p
                    className={`mb-2 ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No tienes notificaciones
                  </p>
                  <p
                    className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Las notificaciones aparecerán aquí cuando ocurran eventos importantes
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'explicacion':
        return (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Cómo Funciona YigiCoin
            </h2>

            <div
              className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-gray-800 to-gray-700 border-gray-600' : 'from-blue-50 to-purple-50 border-blue-200'} rounded-xl p-6 border`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-lightbulb-line text-2xl text-white"></i>
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Plataforma de Oportunidades
                </h3>
                <p className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
                  YigiCoin es una plataforma que te permite generar ingresos a través de un sistema
                  de niveles y referidos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-user-add-line text-white text-xl"></i>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      1. Registro y Activación
                    </h3>
                  </div>
                  <ul
                    className={`space-y-2 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Regístrate con un enlace de referido único
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Paga $3 USD para activar tu cuenta
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Obtén acceso a la plataforma
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Recibe 2 enlaces únicos para referir
                    </li>
                  </ul>
                </div>

                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-group-line text-white text-xl"></i>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      2. Sistema de Referidos
                    </h3>
                  </div>
                  <ul
                    className={`space-y-2 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Comparte tus enlaces únicos
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Cada enlace solo funciona una vez
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Ganas según tu rango actual
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Límite basado en tu nivel
                    </li>
                  </ul>
                </div>

                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-arrow-up-line text-white text-xl"></i>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      3. Ascenso de Niveles
                    </h3>
                  </div>
                  <ul
                    className={`space-y-2 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Paga para ascender al siguiente nivel
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Duplica tu límite de referidos
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Aumenta tu precio de venta
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Desbloquea nuevos beneficios
                    </li>
                  </ul>
                </div>

                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-time-line text-white text-xl"></i>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                    >
                      4. Tiempo Activo por Rango
                    </h3>
                  </div>
                  <ul
                    className={`space-y-2 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Registrado: 48 horas iniciales
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Invitado a Premium: 3-5 minutos
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      VIP+ tiene tótems protectores
                    </li>
                    <li className="flex items-start">
                      <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
                      Elite: Sin límite de tiempo
                    </li>
                  </ul>
                </div>
              </div>

              <div
                className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-6`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Simulación de Progresión de Rangos
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b-2 ${selectedTheme === 'oscuro' ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <th
                          className={`text-left py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Nivel
                        </th>
                        <th
                          className={`text-left py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Nombre
                        </th>
                        <th
                          className={`text-left py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Costo
                        </th>
                        <th
                          className={`text-left py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Tiempo
                        </th>
                        <th
                          className={`text-left py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Beneficios Clave
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={`border-b transition-colors ${selectedTheme === 'oscuro' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td
                          className={`py-3 px-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          1
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Registrado
                        </td>
                        <td className="py-3 px-4 text-green-600">$3</td>
                        <td className="py-3 px-4 text-blue-600">48h</td>
                        <td
                          className={`py-3 px-4 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Acceso básico, 2 referidos
                        </td>
                      </tr>
                      <tr
                        className={`border-b transition-colors ${selectedTheme === 'oscuro' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td
                          className={`py-3 px-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          2
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Invitado
                        </td>
                        <td className="py-3 px-4 text-green-600">$5</td>
                        <td className="py-3 px-4 text-blue-600">5min</td>
                        <td
                          className={`py-3 px-4 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Balance visible, 4 referidos
                        </td>
                      </tr>
                      <tr
                        className={`border-b transition-colors ${selectedTheme === 'oscuro' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td
                          className={`py-3 px-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          3
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Básico
                        </td>
                        <td className="py-3 px-4 text-green-600">$10</td>
                        <td className="py-3 px-4 text-blue-600">3min</td>
                        <td
                          className={`py-3 px-4 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Niveles, beneficios, temas
                        </td>
                      </tr>
                      <tr
                        className={`border-b transition-colors ${selectedTheme === 'oscuro' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td
                          className={`py-3 px-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          4
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          VIP
                        </td>
                        <td className="py-3 px-4 text-green-600">$50</td>
                        <td className="py-3 px-4 text-blue-600">4min</td>
                        <td
                          className={`py-3 px-4 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Panel, 1 tótem protector
                        </td>
                      </tr>
                      <tr
                        className={`border-b transition-colors ${selectedTheme === 'oscuro' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td
                          className={`py-3 px-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          5
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Premium
                        </td>
                        <td className="py-3 px-4 text-green-600">$400</td>
                        <td className="py-3 px-4 text-blue-600">5min</td>
                        <td
                          className={`py-3 px-4 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          2 tótems, loterías exclusivas
                        </td>
                      </tr>
                      <tr
                        className={`transition-colors ${selectedTheme === 'oscuro' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      >
                        <td
                          className={`py-3 px-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          6
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Elite
                        </td>
                        <td className="py-3 px-4 text-green-600">$6,000</td>
                        <td className="py-3 px-4 text-purple-600">∞</td>
                        <td
                          className={`py-3 px-4 text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-800'}`}
                        >
                          Sin límites, acceso total
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-red-900/30 to-yellow-900/30 border-red-600' : 'from-red-50 to-yellow-50 border-red-200'} rounded-xl p-6 border`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-red-300' : 'text-red-800'}`}
                >
                  <i className="ri-alert-line mr-2"></i>
                  Términos y Condiciones Importantes
                </h3>
                <div className="space-y-3">
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-red-200'} rounded-lg p-4 border`}
                  >
                    <h4
                      className={`font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-red-300' : 'text-red-800'}`}
                    >
                      Beneficios por Ascenso
                    </h4>
                    <p
                      className={`text-sm ${selectedTheme === 'oscuro' ? 'text-red-200' : 'text-red-700'}`}
                    >
                      Cada ascenso de nivel desbloquea nuevos beneficios, herramientas y
                      oportunidades de ganancia. Los beneficios son acumulativos y permanentes.
                    </p>
                  </div>
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-red-200'} rounded-lg p-4 border`}
                  >
                    <h4
                      className={`font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-red-300' : 'text-red-800'}`}
                    >
                      Cláusula de Exoneración
                    </h4>
                    <p
                      className={`text-sm ${selectedTheme === 'oscuro' ? 'text-red-200' : 'text-red-700'}`}
                    >
                      YigiCoin se exonera de responsabilidad por hackeos, robos de datos, pérdidas
                      por terceros o circunstancias fuera de nuestro control directo.
                    </p>
                  </div>
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-red-200'} rounded-lg p-4 border`}
                  >
                    <h4
                      className={`font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-red-300' : 'text-red-800'}`}
                    >
                      Política de Reembolsos
                    </h4>
                    <p
                      className={`text-sm ${selectedTheme === 'oscuro' ? 'text-red-200' : 'text-red-700'}`}
                    >
                      Los pagos de ascenso son finales. No se procesan reembolsos una vez completada
                      la transacción y activados los beneficios del nivel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'configuracion':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-settings-line text-2xl text-white"></i>
              </div>
              <h2
                className={`text-2xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                Configuración
              </h2>
              <p className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
                Abriendo ventana de configuración...
              </p>
            </div>
          </div>
        );

      case 'publicidad':
        return <PublicidadSection selectedTheme={selectedTheme} />;

      default:
        return (
          <div className="text-center py-12">
            <h2
              className={`text-2xl font-bold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Sección en desarrollo
            </h2>
            <p className={selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}>
              Esta funcionalidad estará disponible pronto.
            </p>
          </div>
        );
    }
  };

  const handleUsePointsForTime = (packageType: string) => {
    const success = usePointsForTimeExtension();
    if (success) {
      modalState.closeModal('showTimerModal');

      // Agregar tiempo según el paquete (simulamos que los puntos dan el mismo tiempo que $2 USD)
      const additionalSeconds = 172800; // 48 horas como el paquete de $2
      timerState.addTime(additionalSeconds);
    }
  };

  if (!mounted || !simulationMounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando simulación...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {simulationState.currentRank !== 'elite' && timerState.isPageBlocked && (
        <div className="fixed inset-0 bg-black/30 z-40"></div>
      )}

      <FloatingTimer
        show={timerState.showFloatingTimer}
        timer={timerState.timer}
        onResetTimer={timerState.updateTimer}
        updateButtonCooldown={timerState.updateButtonCooldown}
        isUpdateButtonDisabled={timerState.isUpdateButtonDisabled}
      />

      {!modalState.showSupportChat && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => modalState.openModal('showSupportChat')}
            className="bg-blue-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <i className="ri-message-2-line text-lg sm:text-xl"></i>
          </button>
        </div>
      )}

      <SupportChat
        show={modalState.showSupportChat}
        onClose={() => modalState.closeModal('showSupportChat')}
      />

      <div
        className={`min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-300 ${selectedTheme === 'oscuro' ? 'bg-gray-900' : ''
          }`}
        style={{
          backgroundImage:
            selectedTheme === 'claro'
              ? `url('https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/ebaf276b4f400c457fd43c320cfe98d3.jfif')`
              : selectedTheme === 'oscuro'
                ? `url('https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/758b018ee4d6b74d66b6c94984a31f95.jfif')`
                : 'none',
        }}
      >
        {selectedTheme === 'claro' && <div className="absolute inset-0 bg-black/20"></div>}
        {selectedTheme === 'oscuro' && <div className="absolute inset-0 bg-black/40"></div>}

        <div className="relative z-10">
          <TopNavigation
            timer={timerState.timer}
            isPageBlocked={simulationState.currentRank !== 'elite' && timerState.isPageBlocked}
            resetTimer={timerState.resetTimer}
            updateTimer={timerState.updateTimer}
            setShowTimerModal={() => modalState.openModal('showTimerModal')}
            setShowInfoModal={() => modalState.openModal('showInfoModal')}
            setActiveTab={handleTabChange}
            notificacionesPendientes={simulationState.unreadCount}
            showUserMenu={modalState.showUserMenu}
            setShowUserMenu={(show) =>
              show ? modalState.openModal('showUserMenu') : modalState.closeModal('showUserMenu')
            }
            currentUserLevel={currentUserLevel}
            onShowAccountModal={() => modalState.openModal('showAccountModal')}
            updateButtonCooldown={timerState.updateButtonCooldown}
            isUpdateButtonDisabled={timerState.isUpdateButtonDisabled}
            selectedTheme={selectedTheme}
          />

          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <NavigationTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                isPageBlocked={simulationState.currentRank !== 'elite' && timerState.isPageBlocked}
                selectedTheme={selectedTheme}
                highlightedTabs={highlightedTabs}
              />

              <div className="flex-1 min-w-0">
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white/95 border-gray-200 text-gray-900'} backdrop-blur-sm rounded-xl border p-3 sm:p-4 lg:p-6 min-h-[600px] transition-all duration-300`}
                >
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountModal
        show={modalState.showAccountModal}
        onClose={() => modalState.closeModal('showAccountModal')}
        onSuccess={() => {
          modalState.closeModal('showAccountModal');
          setActiveTab('oficina');
        }}
      />

      <SuspendedAccountModal
        show={modalState.showZeroTimeModal}
        onClose={() => modalState.closeModal('showZeroTimeModal')}
        reactivationTimer={timerState.reactivationTimer}
        penaltyPrice={timerState.penaltyPrice}
        formatReactivationTimer={timerState.formatReactivationTimer}
        onShowPenaltyPayment={handlePenaltyPayment}
      />

      {modalState.showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`${selectedTheme === 'oscuro' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4`}
          >
            <div className="text-center mb-6">
              <i className="ri-information-line text-4xl text-blue-600 mb-4"></i>
              <h3 className={`text-xl font-semibold mb-4 text-blue-600`}>
                Información de Simulación
              </h3>
              <div
                className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 text-left`}
              >
                <p
                  className={`text-sm leading-relaxed mb-3 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-blue-700'}`}
                >
                  <strong>Sistema de simulación activo:</strong>
                </p>
                <p
                  className={`text-sm leading-relaxed mb-3 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-blue-700'}`}
                >
                  Tu rango actual: <strong>{currentRankData?.name}</strong>
                </p>
                <p
                  className={`text-sm leading-relaxed mb-3 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-blue-700'}`}
                >
                  Balance disponible: <strong>${simulationState.balance} USD</strong>
                </p>
                {simulationState.currentRank !== 'elite' && (
                  <p
                    className={`text-sm leading-relaxed font-semibold ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-blue-700'}`}
                  >
                    Tiempo restante: <strong>{timerState.formatTimer(timerState.timer)}</strong>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => modalState.closeModal('showInfoModal')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {modalState.showTimerModal && simulationState.currentRank !== 'elite' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`${selectedTheme === 'oscuro' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4`}
          >
            <div className="text-center mb-6">
              <i className="ri-time-line text-4xl text-blue-600 mb-4"></i>
              <h3
                className={`text-xl font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                Extender Tiempo de Cuenta
              </h3>
              <p
                className={`text-sm mb-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Selecciona una opción para mantener tu cuenta activa
              </p>
            </div>
            <div className="space-y-3 mb-6">
              {/* NUEVO: Opción con puntos */}
              <button
                onClick={() => handleUsePointsForTime('puntos')}
                disabled={simulationState.points < 100}
                className={`w-full p-4 rounded-lg transition-colors cursor-pointer text-left ${simulationState.points >= 100
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold flex items-center">
                      <i className="ri-star-line mr-2"></i>
                      100 Puntos
                    </p>
                    <p className="text-sm text-yellow-100">48 horas adicionales</p>
                  </div>
                  <i className="ri-arrow-right-line"></i>
                </div>
                {simulationState.points < 100 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Necesitas {100 - simulationState.points} puntos más
                  </p>
                )}
              </button>

              <button
                onClick={() => handleTimePackageSelect('2usd')}
                className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">$2 USD</p>
                    <p className="text-sm text-blue-100">48 horas</p>
                  </div>
                  <i className="ri-arrow-right-line"></i>
                </div>
              </button>
              <button
                onClick={() => handleTimePackageSelect('5usd')}
                className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">$5 USD</p>
                    <p className="text-sm text-green-100">100 horas</p>
                  </div>
                  <i className="ri-arrow-right-line"></i>
                </div>
              </button>
            </div>
            <button
              onClick={() => modalState.closeModal('showTimerModal')}
              className={`w-full py-3 rounded-lg transition-colors cursor-pointer ${selectedTheme === 'oscuro' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modalState.showTimePaymentModal && modalState.selectedTimePackage && (
        <ModalPago
          show={modalState.showTimePaymentModal}
          onClose={() => {
            modalState.closeModal('showTimePaymentModal');
            modalState.setSelectedTimePackage(null);
          }}
          title="Extender Tiempo de Cuenta"
          amount={modalState.selectedTimePackage === '2usd' ? 2 : 5}
          description={
            modalState.selectedTimePackage === '2usd'
              ? '48 horas adicionales'
              : '100 horas adicionales'
          }
          paymentType="tiempo"
          onPaymentSuccess={handleTimeExtensionPayment}
        />
      )}

      {modalState.showPenaltyPaymentModal && (
        <ModalPago
          show={modalState.showPenaltyPaymentModal}
          onClose={() => modalState.closeModal('showPenaltyPaymentModal')}
          title="Pago de Sanción"
          amount={timerState.penaltyPrice}
          description="Reactivación de cuenta suspendida"
          paymentType="multa"
          onPaymentSuccess={(details) => { 
            simulatePaymentSuccess('sancion', details.amount);
            modalState.closeModal('showPenaltyPaymentModal');
            timerState.resetTimer(); }}
        />
      )}

      {showUpgradeModal && upgradeModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`${selectedTheme === 'oscuro' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform scale-100 upgrade-modal-animated animate-bounce`}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <i className="ri-trophy-line text-3xl text-white"></i>
              </div>
              <div className="mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  ¡Felicitaciones! 🎉
                </h3>
                <p
                  className={`text-lg mb-4 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Has ascendido exitosamente al nivel:
                </p>
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-500' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4 mb-4`}
                >
                  <p className="text-2xl font-bold text-blue-600">{upgradeModalData.name}</p>
                </div>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  • Nuevos beneficios desbloqueados
                </p>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  • Balance actualizado
                </p>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  • Funcionalidades ampliadas
                </p>
              </div>
              <button
                onClick={handleCloseUpgradeModal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer shadow-lg whitespace-nowrap"
              >
                Continuar
              </button>
            </div>
          </div>
          {/* CSS personalizado para la animación que disminuye gradualmente */}
          <style jsx>{`
            @keyframes diminishingBounce {
              0% {
                transform: translateY(-20px) scale(1.05);
              }
              10% {
                transform: translateY(-15px) scale(1.04);
              }
              20% {
                transform: translateY(-10px) scale(1.03);
              }
              30% {
                transform: translateY(-8px) scale(1.025);
              }
              40% {
                transform: translateY(-6px) scale(1.02);
              }
              50% {
                transform: translateY(-4px) scale(1.015);
              }
              60% {
                transform: translateY(-3px) scale(1.01);
              }
              70% {
                transform: translateY(-2px) scale(1.008);
              }
              80% {
                transform: translateY(-1px) scale(1.005);
              }
              90% {
                transform: translateY(-0.5px) scale(1.002);
              }
              100% {
                transform: translateY(0) scale(1);
              }
            }

            .animate-diminishing-bounce {
              animation: diminishingBounce 4s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
