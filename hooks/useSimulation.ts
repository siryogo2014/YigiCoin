'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserRank {
  id: string;
  name: string;
  price: number;
  maxReferrals: number;
  timerDuration: number; // en segundos
  benefits: string[];
  expectedIncome: number; // Nuevo: ingreso esperado por rango
  // NUEVO: Beneficios de publicidad
  monthlyVisits: number;
  adPackages: number;
}

export interface SimulationNotification {
  id: number;
  type: 'payment' | 'upgrade' | 'referral' | 'benefit' | 'time' | 'points' | 'lottery';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
}

// NUEVO: Interfaces para publicidad y sorteos
export interface UserAd {
  id: string;
  userId: string;
  userName: string;
  userRank: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  createdAt: string;
  viewsUsed: number;
  maxViews: number;
  isActive: boolean;
}

export interface AdView {
  adId: string;
  userId: string;
  viewedAt: string;
  pointsClaimed: boolean;
  nextClaimTime: string;
}

export interface LotteryEntry {
  id: string;
  userId: string;
  lotteryType: 'semanal' | 'mensual';
  entryDate: string;
  pointsSpent: number;
}

export interface Lottery {
  id: string;
  type: 'semanal' | 'mensual';
  prize: number;
  endDate: string;
  participants: number;
  isActive: boolean;
}

export interface SimulationState {
  currentRank: string;
  balance: number;
  referralCount: number;
  subReferralCount: number;
  totalNetwork: number;
  notifications: SimulationNotification[];
  unreadCount: number;
  availableTabs: string[];
  totemCount: number;
  hasTimeExtension: boolean;
  themeOptions: string[];
  digitalBooks: string[];
  lotteries: string[];
  transactionHistory: TransactionRecord[];
  // NUEVO: Sistema de puntos y publicidad
  points: number;
  userAds: UserAd[];
  adViews: AdView[];
  lotteryEntries: LotteryEntry[];
  activeLotteries: Lottery[];
}

export interface TransactionRecord {
  id: number;
  tipo: 'Ingreso' | 'Compra';
  descripcion: string;
  monto: number;
  fecha: string;
  estado: 'Completado' | 'Pendiente';
  rangoOrigen?: string;
}

const RANKS: Record<string, UserRank> = {
  registrado: {
    id: 'registrado',
    name: 'Registrado',
    price: 3,
    maxReferrals: 2,
    timerDuration: 172800, // 48 horas
    benefits: ['Acceso básico', 'Enlaces de referido', 'Soporte estándar'],
    expectedIncome: 6,
    monthlyVisits: 0,
    adPackages: 0,
  },
  invitado: {
    id: 'invitado',
    name: 'Invitado',
    price: 5,
    maxReferrals: 4,
    timerDuration: 300, // 5 minutos
    benefits: ['Balance visible', 'Herramientas mejoradas', 'Comisiones por referido'],
    expectedIncome: 20,
    monthlyVisits: 100,
    adPackages: 1,
  },
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 10,
    maxReferrals: 8,
    timerDuration: 180, // 3 minutos
    benefits: [
      'Sistema de niveles',
      'Beneficios premium',
      'Sorteos',
      'Libros digitales',
      'Temas personalizables',
    ],
    expectedIncome: 80,
    monthlyVisits: 500,
    adPackages: 1,
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    price: 50,
    maxReferrals: 16,
    timerDuration: 240, // 4 minutos
    benefits: [
      'Panel de control',
      '1 Tótem digital',
      'Reactivación automática',
      'Acceso prioritario',
    ],
    expectedIncome: 800,
    monthlyVisits: 1000,
    adPackages: 1,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 400,
    maxReferrals: 32,
    timerDuration: 300, // 5 minutos
    benefits: [
      '2 Tótems digitales',
      'Loterías exclusivas',
      'Beneficios VIP+',
      'Herramientas avanzadas',
    ],
    expectedIncome: 12800,
    monthlyVisits: 2000,
    adPackages: 2,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 6000,
    maxReferrals: 64,
    timerDuration: -1, // Sin temporizador
    benefits: [
      'Sin límites de tiempo',
      'Acceso completo',
      'Todas las funcionalidades',
      'Estatus Elite',
    ],
    expectedIncome: 384000,
    monthlyVisits: 5000,
    adPackages: 2,
  },
};

const BASE_TABS = [
  'oficina',
  'ascender',
  'referidos',
  'promotor',
  'explicacion',
  'notificaciones',
  'configuracion',
];

// NUEVO: Función para inicializar sorteos activos
const initializeLotteries = (): Lottery[] => {
  const now = new Date();
  const weeklyEnd = new Date(now);
  weeklyEnd.setDate(now.getDate() + (7 - now.getDay())); // Próximo domingo

  const monthlyEnd = new Date(now);
  monthlyEnd.setMonth(now.getMonth() + 1, 0); // Último día del mes

  return [
    {
      id: 'weekly_' + now.getTime(),
      type: 'semanal',
      prize: Math.floor(Math.random() * 400) + 100, // 100-500 USD
      endDate: weeklyEnd.toISOString(),
      participants: Math.floor(Math.random() * 50) + 10,
      isActive: true,
    },
    {
      id: 'monthly_' + now.getTime(),
      type: 'mensual',
      prize: Math.floor(Math.random() * 400) + 100, // 100-500 USD
      endDate: monthlyEnd.toISOString(),
      participants: Math.floor(Math.random() * 200) + 50,
      isActive: true,
    },
  ];
};

// Función auxiliar para generar historial de transacciones realista por rango
const generateTransactionHistory = (currentRank: string, balance: number): TransactionRecord[] => {
  const transactions: TransactionRecord[] = [];
  let transactionId = 1;

  // Verificar si existen transacciones guardadas del registro
  const savedTransactions = localStorage.getItem('simulation_transactions');
  if (savedTransactions) {
    try {
      const parsedTransactions = JSON.parse(savedTransactions);
      transactions.push(...parsedTransactions);
      transactionId = parsedTransactions.length + 1;
    } catch (error) {
      console.error('Error loading saved transactions:', error);
    }
  }

  // Generar transacciones basadas en la progresión del rango
  const rankOrder = ['registrado', 'invitado', 'basico', 'vip', 'premium', 'elite'];
  const currentIndex = rankOrder.indexOf(currentRank);

  for (let i = 1; i <= currentIndex; i++) {
    const rankData = RANKS[rankOrder[i]];

    // Agregar ingreso por referidos del rango actual (solo si no existe)
    const existingIncome = transactions.find(
      (t) => t.descripcion.includes(`Nivel ${rankData.name}`) && t.tipo === 'Ingreso'
    );

    if (!existingIncome) {
      transactions.push({
        id: transactionId++,
        tipo: 'Ingreso',
        descripcion: `Ingresos por referidos - Nivel ${rankData.name}`,
        monto: rankData.expectedIncome,
        fecha: new Date(Date.now() - (currentIndex - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        estado: 'Completado',
        rangoOrigen: rankData.name,
      });
    }

    // Agregar compra de ascenso (excepto para el rango actual)
    if (i < currentIndex) {
      const nextRank = RANKS[rankOrder[i + 1]];
      const existingUpgrade = transactions.find(
        (t) => t.descripcion.includes(`Ascenso a ${nextRank.name}`) && t.tipo === 'Compra'
      );

      if (!existingUpgrade) {
        transactions.push({
          id: transactionId++,
          tipo: 'Compra',
          descripcion: `Ascenso a ${nextRank.name}`,
          monto: -nextRank.price,
          fecha: new Date(
            Date.now() - (currentIndex - i - 1) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          estado: 'Completado',
        });
      }
    }
  }

  return transactions.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const useSimulation = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentRank: 'registrado',
    balance: 6, // CORREGIDO: Siempre inicializar con $6 USD
    referralCount: 2,
    subReferralCount: 1,
    totalNetwork: 3,
    notifications: [],
    unreadCount: 0,
    availableTabs: BASE_TABS,
    totemCount: 0,
    hasTimeExtension: false,
    themeOptions: [],
    digitalBooks: [],
    lotteries: [],
    transactionHistory: [],
    // NUEVO: Inicializar sistema de puntos
    points: 0,
    userAds: [],
    adViews: [],
    lotteryEntries: [],
    activeLotteries: [],
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSimulationData();
  }, []);

  const loadSimulationData = useCallback(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
      const notifications = JSON.parse(localStorage.getItem('simulation_notifications') || '[]');
      // NUEVO: Cargar datos de publicidad y sorteos
      const userAds = JSON.parse(localStorage.getItem('user_ads') || '[]');
      const adViews = JSON.parse(localStorage.getItem('ad_views') || '[]');
      const lotteryEntries = JSON.parse(localStorage.getItem('lottery_entries') || '[]');
      const savedLotteries = JSON.parse(localStorage.getItem('active_lotteries') || '[]');

      // NUEVO: Si no hay datos de usuario, usar estado inicial por defecto
      const currentRank = userData.currentRank || 'registrado';
      const balance = userData.balance || 6; // Siempre $6 USD inicial
      const points = userData.points || 0;

      const availableTabs = getAvailableTabsForRank(currentRank);
      const { totemCount, themeOptions, digitalBooks, lotteries } = getBenefitsForRank(currentRank);
      const transactionHistory = generateTransactionHistory(currentRank, balance);

      // Inicializar sorteos si no existen
      const activeLotteries = savedLotteries.length > 0 ? savedLotteries : initializeLotteries();
      if (savedLotteries.length === 0) {
        localStorage.setItem('active_lotteries', JSON.stringify(activeLotteries));
      }

      setSimulationState({
        currentRank,
        balance,
        referralCount: userData.referralCount || 2,
        subReferralCount: userData.subReferralCount || 1,
        totalNetwork: userData.totalNetwork || 3,
        notifications: notifications,
        unreadCount: notifications.filter((n: { read: boolean }) => !n.read).length,
        availableTabs,
        totemCount,
        hasTimeExtension: userData.hasTimeExtension || false,
        themeOptions,
        digitalBooks,
        lotteries,
        transactionHistory,
        // NUEVO: Cargar datos del sistema de puntos
        points,
        userAds,
        adViews,
        lotteryEntries,
        activeLotteries,
      });
    } catch (error) {
      console.error('Error loading simulation data:', error);
      // En caso de error, mantener estado inicial
      setSimulationState((prev) => ({
        ...prev,
        currentRank: 'registrado',
        balance: 6,
        referralCount: 2,
        transactionHistory: generateTransactionHistory('registrado', 6),
        activeLotteries: initializeLotteries(),
      }));
    }
  }, []);

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
        return [...baseTabs, 'publicidad']; // NUEVO: Agregar publicidad para todos los rangos
      case 'invitado':
        return [...baseTabs, 'balance', 'publicidad'];
      case 'basico':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'publicidad'];
      case 'vip':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'panel', 'publicidad'];
      case 'premium':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'panel', 'publicidad'];
      case 'elite':
        return [...baseTabs, 'balance', 'niveles', 'beneficios', 'panel', 'publicidad'];
      default:
        return [...baseTabs, 'publicidad'];
    }
  };

  const getBenefitsForRank = (rank: string) => {
    const benefits = {
      totemCount: 0,
      themeOptions: [] as string[],
      digitalBooks: [] as string[],
      lotteries: [] as string[],
    };

    switch (rank) {
      case 'basico':
        benefits.themeOptions = ['Claro', 'Oscuro'];
        benefits.digitalBooks = ['Guía de Marketing Digital', 'Estrategias de Redes'];
        break;
      case 'vip':
        benefits.totemCount = 1;
        benefits.themeOptions = ['Claro', 'Oscuro'];
        benefits.digitalBooks = [
          'Guía de Marketing Digital',
          'Estrategias de Redes',
          'Liderazgo Empresarial',
        ];
        break;
      case 'premium':
        benefits.totemCount = 2;
        benefits.themeOptions = ['Claro', 'Oscuro'];
        benefits.digitalBooks = [
          'Guía de Marketing Digital',
          'Estrategias de Redes',
          'Liderazgo Empresarial',
          'Inversiones Avanzadas',
        ];
        benefits.lotteries = ['Lotería Semanal Premium', 'Sorteo Mensual Especial'];
        break;
      case 'elite':
        benefits.totemCount = 0; // Elite no necesita tótems
        benefits.themeOptions = ['Claro', 'Oscuro', 'Premium'];
        benefits.digitalBooks = ['Colección completa de libros digitales'];
        benefits.lotteries = ['Todas las loterías disponibles'];
        break;
    }

    return benefits;
  };

  // NUEVO: Funciones para el sistema de publicidad
  const createUserAd = useCallback(
    (
      adData: Omit<
        UserAd,
        'id' | 'userId' | 'userName' | 'userRank' | 'createdAt' | 'viewsUsed' | 'isActive'
      >
    ) => {
      const currentRankData = RANKS[simulationState.currentRank];
      if (simulationState.userAds.length >= currentRankData.adPackages) {
        return false; // No se pueden crear más anuncios
      }

      const newAd: UserAd = {
        id: `ad_${Date.now()}`,
        userId: 'current_user',
        userName: 'Usuario Demo',
        userRank: simulationState.currentRank,
        ...adData,
        createdAt: new Date().toISOString(),
        viewsUsed: 0,
        maxViews: currentRankData.monthlyVisits,
        isActive: true,
      };

      const updatedAds = [...simulationState.userAds, newAd];
      const updatedState = { ...simulationState, userAds: updatedAds };

      setSimulationState(updatedState);
      localStorage.setItem('user_ads', JSON.stringify(updatedAds));

      return true;
    },
    [simulationState]
  );

  // NUEVO: Función para reclamar puntos de un anuncio
  const claimAdPoints = useCallback(
    (adId: string) => {
      const now = new Date();
      const userId = 'current_user';

      // Verificar si ya reclamó puntos en las últimas 24h
      const existingView = simulationState.adViews.find(
        (view) => view.adId === adId && view.userId === userId
      );

      if (existingView && new Date(existingView.nextClaimTime) > now) {
        return false; // No puede reclamar aún
      }

      const nextClaimTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

      const newView: AdView = {
        adId,
        userId,
        viewedAt: now.toISOString(),
        pointsClaimed: true,
        nextClaimTime: nextClaimTime.toISOString(),
      };

      const updatedViews = existingView
        ? simulationState.adViews.map((view) =>
            view.adId === adId && view.userId === userId ? newView : view
          )
        : [...simulationState.adViews, newView];

      const newPoints = simulationState.points + 5;

      const updatedState = {
        ...simulationState,
        adViews: updatedViews,
        points: newPoints,
      };

      setSimulationState(updatedState);
      localStorage.setItem('ad_views', JSON.stringify(updatedViews));

      // Actualizar puntos en userData
      const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
      userData.points = newPoints;
      localStorage.setItem('user_simulation_data', JSON.stringify(userData));

      return true;
    },
    [simulationState]
  );

  // NUEVO: Función para participar en sorteos
  const enterLottery = useCallback(
    (lotteryId: string, lotteryType: 'semanal' | 'mensual') => {
      if (simulationState.points < 50) {
        return false; // No tiene suficientes puntos
      }

      const newEntry: LotteryEntry = {
        id: `entry_${Date.now()}`,
        userId: 'current_user',
        lotteryType,
        entryDate: new Date().toISOString(),
        pointsSpent: 50,
      };

      const updatedEntries = [...simulationState.lotteryEntries, newEntry];
      const newPoints = simulationState.points - 50;

      // Actualizar participantes en el sorteo
      const updatedLotteries = simulationState.activeLotteries.map((lottery) =>
        lottery.id === lotteryId ? { ...lottery, participants: lottery.participants + 1 } : lottery
      );

      const updatedState = {
        ...simulationState,
        lotteryEntries: updatedEntries,
        points: newPoints,
        activeLotteries: updatedLotteries,
      };

      setSimulationState(updatedState);
      localStorage.setItem('lottery_entries', JSON.stringify(updatedEntries));
      localStorage.setItem('active_lotteries', JSON.stringify(updatedLotteries));

      // Actualizar puntos en userData
      const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
      userData.points = newPoints;
      localStorage.setItem('user_simulation_data', JSON.stringify(userData));

      return true;
    },
    [simulationState]
  );

  const upgradeToRank = useCallback(
    (newRank: string) => {
      const rankData = RANKS[newRank];
      if (!rankData) return false;

      // Calcular nuevo balance con ingresos exactos por rango
      const upgradeCost = rankData.price;
      const newBalance = simulationState.balance - upgradeCost;

      if (newBalance < 0) return false;

      // Simular ingresos exactos según la especificación
      const simulatedEarnings = rankData.expectedIncome;
      const finalBalance = newBalance + simulatedEarnings;

      // NUEVO: Otorgar puntos automáticos por ascenso
      const bonusPoints = rankData.price; // 1 punto por cada dólar gastado en ascenso
      const newPoints = simulationState.points + bonusPoints;

      const availableTabs = getAvailableTabsForRank(newRank);
      const { totemCount, themeOptions, digitalBooks, lotteries } = getBenefitsForRank(newRank);

      // Crear notificaciones de ascenso
      const newNotifications: SimulationNotification[] = [
        {
          id: Date.now() + 1,
          type: 'payment',
          title: 'Pago Recibido',
          message: `Has recibido un pago de $${simulatedEarnings.toLocaleString()} por ${rankData.maxReferrals} referidos del nivel ${rankData.name}`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-money-dollar-circle-line',
          color: 'green',
        },
        {
          id: Date.now() + 2,
          type: 'upgrade',
          title: 'Ascenso Disponible',
          message: `¡Felicidades! Has ascendido al nivel ${rankData.name}`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-arrow-up-line',
          color: 'purple',
        },
        {
          id: Date.now() + 3,
          type: 'points',
          title: 'Puntos Otorgados',
          message: `Has recibido ${bonusPoints} puntos por ascender a ${rankData.name}`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-star-line',
          color: 'yellow',
        },
        {
          id: Date.now() + 4,
          type: 'benefit',
          title: 'Nuevo Beneficio Desbloqueado',
          message: `Nuevas funcionalidades desbloqueadas para el nivel ${rankData.name}`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-gift-line',
          color: 'orange',
        },
      ];

      if (newRank !== 'elite') {
        newNotifications.push({
          id: Date.now() + 5,
          type: 'time',
          title: 'Tiempo Extendido',
          message: `Tu tiempo de cuenta ha sido renovado a ${Math.floor(rankData.timerDuration / 60)} minutos`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-time-line',
          color: 'blue',
        });
      }

      // Generar nuevo historial de transacciones
      const transactionHistory = generateTransactionHistory(newRank, finalBalance);

      const updatedState = {
        ...simulationState,
        currentRank: newRank,
        balance: finalBalance,
        points: newPoints, // NUEVO: Actualizar puntos
        referralCount: rankData.maxReferrals,
        subReferralCount: Math.floor(rankData.maxReferrals * 1.5),
        totalNetwork: Math.floor(rankData.maxReferrals * 2.5),
        notifications: [...newNotifications, ...simulationState.notifications],
        unreadCount: simulationState.unreadCount + newNotifications.length,
        availableTabs,
        totemCount,
        hasTimeExtension: true,
        themeOptions,
        digitalBooks,
        lotteries,
        transactionHistory,
      };

      setSimulationState(updatedState);

      // Guardar en localStorage
      const userData = {
        currentRank: newRank,
        balance: finalBalance,
        points: newPoints, // NUEVO: Guardar puntos
        referralCount: updatedState.referralCount,
        subReferralCount: updatedState.subReferralCount,
        totalNetwork: updatedState.totalNetwork,
        hasTimeExtension: true,
      };

      localStorage.setItem('user_simulation_data', JSON.stringify(userData));
      localStorage.setItem('simulation_notifications', JSON.stringify(updatedState.notifications));

      return true;
    },
    [simulationState]
  );

  const markNotificationAsRead = useCallback(
    (notificationId: number) => {
      const updatedNotifications = simulationState.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );

      const updatedState = {
        ...simulationState,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };

      setSimulationState(updatedState);
      localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));
    },
    [simulationState]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    const updatedNotifications = simulationState.notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    const updatedState = {
      ...simulationState,
      notifications: updatedNotifications,
      unreadCount: 0,
    };

    setSimulationState(updatedState);
    localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));
  }, [simulationState]);

  // CORREGIDO: Función específica para pagos de extensión de tiempo manual
  const simulatePaymentSuccess = useCallback(
    (type: 'tiempo' | 'sancion', amount: number) => {
      // CORREGIDO: Solo crear notificación específica para extensión MANUAL de tiempo
      if (type === 'tiempo') {
        const timeHours = amount === 2 ? 48 : 100;
        const newNotification: SimulationNotification = {
          id: Date.now(),
          type: 'time',
          title: 'Tiempo Extendido Correctamente',
          message: `Has extendido tu tiempo de cuenta manualmente por $${amount} USD. Se agregaron ${timeHours} horas a tu contador actual`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-time-line',
          color: 'green',
        };

        const updatedNotifications = [newNotification, ...simulationState.notifications];
        const updatedState = {
          ...simulationState,
          notifications: updatedNotifications,
          unreadCount: simulationState.unreadCount + 1,
          hasTimeExtension: true,
        };

        setSimulationState(updatedState);
        localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));

        // Actualizar datos de usuario
        const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
        userData.hasTimeExtension = true;
        localStorage.setItem('user_simulation_data', JSON.stringify(userData));
      }

      // Para sanciones, mantener comportamiento original
      if (type === 'sancion') {
        const newNotification: SimulationNotification = {
          id: Date.now(),
          type: 'time',
          title: 'Cuenta Reactivada',
          message: `Pago de sanción de $${amount} USD completado. Cuenta reactivada`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: 'ri-shield-check-line',
          color: 'green',
        };

        const updatedNotifications = [newNotification, ...simulationState.notifications];
        const updatedState = {
          ...simulationState,
          notifications: updatedNotifications,
          unreadCount: simulationState.unreadCount + 1,
          hasTimeExtension: true,
        };

        setSimulationState(updatedState);
        localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));

        // Actualizar datos de usuario
        const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
        userData.hasTimeExtension = true;
        localStorage.setItem('user_simulation_data', JSON.stringify(userData));
      }

      return true;
    },
    [simulationState]
  );

  const getCurrentRankData = useCallback(() => {
    return RANKS[simulationState.currentRank];
  }, [simulationState.currentRank]);

  const getNextRankData = useCallback(() => {
    const currentRankData = getCurrentRankData();
    const ranks = Object.keys(RANKS);
    const currentIndex = ranks.indexOf(simulationState.currentRank);

    if (currentIndex < ranks.length - 1) {
      return RANKS[ranks[currentIndex + 1]];
    }

    return null;
  }, [simulationState.currentRank, getCurrentRankData]);

  const canUpgrade = useCallback(() => {
    const nextRank = getNextRankData();
    return nextRank && simulationState.balance >= nextRank.price;
  }, [simulationState.balance, getNextRankData]);

  const useTotem = useCallback(() => {
    if (simulationState.totemCount > 0) {
      const updatedState = {
        ...simulationState,
        hasTimeExtension: true,
      };

      setSimulationState(updatedState);

      // Agregar notificación de tótem usado
      const newNotification: SimulationNotification = {
        id: Date.now(),
        type: 'time',
        title: 'Tótem Activado',
        message: 'Has usado un tótem para reactivar tu cuenta automáticamente',
        timestamp: new Date().toISOString(),
        read: false,
        icon: 'ri-magic-line',
        color: 'purple',
      };

      const updatedNotifications = [newNotification, ...simulationState.notifications];
      localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));

      return true;
    }
    return false;
  }, [simulationState]);

  const usePointsForTimeExtension = useCallback(() => {
    if (simulationState.points < 100) {
      return false; // No tiene suficientes puntos
    }

    const newPoints = simulationState.points - 100;

    // Crear notificación
    const newNotification: SimulationNotification = {
      id: Date.now(),
      type: 'points',
      title: 'Tiempo Extendido con Puntos',
      message: 'Has usado 100 puntos para extender tu cuenta por 48 horas adicionales',
      timestamp: new Date().toISOString(),
      read: false,
      icon: 'ri-star-line',
      color: 'yellow',
    };

    const updatedNotifications = [newNotification, ...simulationState.notifications];
    const updatedState = {
      ...simulationState,
      points: newPoints,
      notifications: updatedNotifications,
      unreadCount: simulationState.unreadCount + 1,
      hasTimeExtension: true,
    };

    setSimulationState(updatedState);

    // Actualizar localStorage
    const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
    userData.points = newPoints;
    userData.hasTimeExtension = true;
    localStorage.setItem('user_simulation_data', JSON.stringify(userData));
    localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));

    return true;
  }, [simulationState]);

  const usePointsForTimerUpdate = useCallback(() => {
    if (simulationState.points < 5) {
      return false; // No tiene suficientes puntos
    }

    const newPoints = simulationState.points - 5;

    // Crear notificación
    const newNotification: SimulationNotification = {
      id: Date.now(),
      type: 'points',
      title: 'Contador Actualizado con Puntos',
      message: 'Has usado 5 puntos para actualizar el contador de tiempo',
      timestamp: new Date().toISOString(),
      read: false,
      icon: 'ri-star-line',
      color: 'yellow',
    };

    const updatedNotifications = [newNotification, ...simulationState.notifications];
    const updatedState = {
      ...simulationState,
      points: newPoints,
      notifications: updatedNotifications,
      unreadCount: simulationState.unreadCount + 1,
    };

    setSimulationState(updatedState);

    // Actualizar localStorage
    const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
    userData.points = newPoints;
    localStorage.setItem('user_simulation_data', JSON.stringify(userData));
    localStorage.setItem('simulation_notifications', JSON.stringify(updatedNotifications));

    return true;
  }, [simulationState]);

  return {
    mounted,
    simulationState,
    upgradeToRank,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    simulatePaymentSuccess,
    getCurrentRankData,
    getNextRankData,
    canUpgrade,
    useTotem,
    // NUEVO: Funciones para publicidad y sorteos
    createUserAd,
    claimAdPoints,
    enterLottery,
    // NUEVAS: Funciones para usar puntos
    usePointsForTimeExtension,
    usePointsForTimerUpdate,
    RANKS,
  };
};
