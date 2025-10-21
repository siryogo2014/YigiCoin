'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import AdViewPage from './AdViewPage';
import type { UserAd, Lottery } from '../hooks/useSimulation';

interface PublicidadSectionProps {
  selectedTheme?: string;
}

function PublicidadSection({ selectedTheme = 'claro' }: PublicidadSectionProps) {
  const { simulationState, createUserAd, claimAdPoints, enterLottery, getCurrentRankData } =
    useSimulation();
  const [activeSubTab, setActiveSubTab] = useState('ver-anuncios');
  const [showCreateAdForm, setShowCreateAdForm] = useState(false);
  const [showAdViewPage, setShowAdViewPage] = useState(false);
  const [selectedAdForView, setSelectedAdForView] = useState<UserAd | null>(null);

  // Estados del formulario
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
  });

  const currentRankData = getCurrentRankData();

  // Funciones auxiliares
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'elite':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-orange-100 text-orange-800';
      case 'vip':
        return 'bg-blue-100 text-blue-800';
      case 'basico':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankName = (rank: string) => {
    const rankNames = {
      registrado: 'Registrado',
      invitado: 'Invitado',
      basico: 'Básico',
      vip: 'VIP',
      premium: 'Premium',
      elite: 'Elite',
    };
    return rankNames[rank as keyof typeof rankNames] || 'Registrado';
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Generar anuncios de muestra (excluyendo los del usuario actual)
  const generateSampleAds = (): UserAd[] => {
    const sampleAds: UserAd[] = [
      {
        id: 'sample_1',
        userId: 'user_1',
        userName: 'María González',
        userRank: 'vip',
        title: 'Curso Completo de Marketing Digital',
        description:
          'Aprende las mejores estrategias de marketing digital con nuestro curso premium. Más de 50 horas de contenido exclusivo.',
        url: 'https://marketing-curso.com',
        imageUrl:
          'https://readdy.ai/api/search-image?query=modern%20digital%20marketing%20course%20online%20education%20laptop%20computer%20screen%20with%20graphics%20charts%20and%20social%20media%20icons%20bright%20professional%20learning%20environment&width=300&height=200&seq=ad1&orientation=landscape',
        createdAt: new Date().toISOString(),
        viewsUsed: 450,
        maxViews: 1000,
        isActive: true,
      },
      {
        id: 'sample_2',
        userId: 'user_2',
        userName: 'Carlos Mendoza',
        userRank: 'premium',
        title: 'Plataforma de Trading Automatizado',
        description:
          'Invierte en criptomonedas y forex con nuestra IA avanzada. Retornos de hasta 15% mensual.',
        url: 'https://crypto-trading.com',
        imageUrl:
          'https://readdy.ai/api/search-image?query=cryptocurrency%20trading%20platform%20interface%20with%20bitcoin%20ethereum%20charts%20graphs%20financial%20data%20modern%20blue%20technology%20background%20professional%20investment&width=300&height=200&seq=ad2&orientation=landscape',
        createdAt: new Date().toISOString(),
        viewsUsed: 1200,
        maxViews: 2000,
        isActive: true,
      },
      {
        id: 'sample_3',
        userId: 'user_3',
        userName: 'Ana Rodriguez',
        userRank: 'basico',
        title: 'Tienda Online de Productos Naturales',
        description:
          'Suplementos y productos 100% naturales para tu salud y bienestar. Envío gratis en compras superiores a $50.',
        url: 'https://natural-health.com',
        imageUrl:
          'https://readdy.ai/api/search-image?query=natural%20health%20products%20organic%20supplements%20bottles%20herbs%20vitamins%20clean%20white%20background%20healthy%20lifestyle%20wellness%20natural%20ingredients&width=300&height=200&seq=ad3&orientation=landscape',
        createdAt: new Date().toISOString(),
        viewsUsed: 300,
        maxViews: 500,
        isActive: true,
      },
      {
        id: 'sample_4',
        userId: 'user_4',
        userName: 'Roberto Silva',
        userRank: 'elite',
        title: 'Consultoría Empresarial Premium',
        description:
          'Acelera el crecimiento de tu negocio con nuestros consultores expertos. Casos de éxito comprobados.',
        url: 'https://business-consulting.com',
        imageUrl:
          'https://readdy.ai/api/search-image?query=business%20consulting%20meeting%20professional%20office%20modern%20conference%20room%20businesspeople%20analyzing%20growth%20charts%20success%20strategy%20planning%20corporate%20environment&width=300&height=200&seq=ad4&orientation=landscape',
        createdAt: new Date().toISOString(),
        viewsUsed: 2800,
        maxViews: 5000,
        isActive: true,
      },
      {
        id: 'sample_5',
        userId: 'user_5',
        userName: 'Laura Pérez',
        userRank: 'invitado',
        title: 'Aplicación de Fitness Personalizada',
        description:
          'Entrena desde casa con rutinas personalizadas. Más de 1000 ejercicios y seguimiento nutricional.',
        url: 'https://fitness-app.com',
        imageUrl:
          'https://readdy.ai/api/search-image?query=fitness%20mobile%20app%20interface%20workout%20routines%20exercise%20videos%20home%20gym%20training%20healthy%20lifestyle%20smartphone%20screen%20modern%20wellness%20technology&width=300&height=200&seq=ad5&orientation=landscape',
        createdAt: new Date().toISOString(),
        viewsUsed: 80,
        maxViews: 100,
        isActive: true,
      },
    ];

    return sampleAds;
  };

  // Combinar anuncios del usuario con anuncios de muestra
  const allAds = [...generateSampleAds(), ...simulationState.userAds];

  // Filtrar para mostrar solo anuncios de otros usuarios
  const otherUsersAds = allAds.filter((ad) => ad.userId !== 'current_user');

  const canCreateAd = () => {
    if (!currentRankData || currentRankData.monthlyVisits === 0) return false;
    return simulationState.userAds.length < currentRankData.adPackages;
  };

  const handleCreateAd = () => {
    if (!adForm.title.trim() || !adForm.description.trim() || !adForm.url.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const success = createUserAd({
      title: adForm.title.trim(),
      description: adForm.description.trim(),
      url: adForm.url.trim(),
      imageUrl: adForm.imageUrl.trim() || undefined,
      // 👇 CAMBIO MÍNIMO: requerido por el tipo UserAd
      maxViews: currentRankData?.monthlyVisits ?? 100,
    });

    if (success) {
      setAdForm({ title: '', description: '', url: '', imageUrl: '' });
      setShowCreateAdForm(false);
      alert('¡Anuncio creado exitosamente!');
    } else {
      alert('No puedes crear más anuncios. Has alcanzado el límite de tu rango.');
    }
  };

  // NUEVA función mejorada para ver anuncios
  const handleViewAd = (ad: UserAd) => {
    if (ad.userId === 'current_user') return;

    setSelectedAdForView(ad);
    setShowAdViewPage(true);
  };

  const handleAdViewClose = () => {
    setShowAdViewPage(false);
    setSelectedAdForView(null);
  };

  const handlePointsClaimed = () => {
    // El componente useSimulation ya maneja la actualización de puntos
    // Solo necesitamos mostrar una notificación de éxito
    alert('¡Has ganado 5 puntos exitosamente!');
  };

  const canClaimPoints = (adId: string) => {
    const existingView = simulationState.adViews.find(
      (view) => view.adId === adId && view.userId === 'current_user'
    );

    if (!existingView) return true;
    return new Date(existingView.nextClaimTime) <= new Date();
  };

  const getTimeUntilNextClaim = (adId: string) => {
    const existingView = simulationState.adViews.find(
      (view) => view.adId === adId && view.userId === 'current_user'
    );

    if (!existingView) return '';

    const nextClaim = new Date(existingView.nextClaimTime);
    const now = new Date();
    const diff = nextClaim.getTime() - now.getTime();

    if (diff <= 0) return '';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m restantes`;
  };

  const handleEnterLottery = (lotteryId: string, lotteryType: 'semanal' | 'mensual') => {
    if (simulationState.points < 50) {
      alert('Necesitas al menos 50 puntos para participar');
      return;
    }

    const success = enterLottery(lotteryId, lotteryType);
    if (success) {
      alert('¡Has participado en el sorteo exitosamente!');
    } else {
      alert('Error al participar en el sorteo');
    }
  };

  const renderVerAnuncios = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3
          className={`text-lg sm:text-xl font-bold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Anuncios de Miembros
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTheme === 'oscuro' ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}`}
        >
          <i className="ri-star-line mr-1"></i>
          {simulationState.points} puntos
        </div>
      </div>

      {otherUsersAds.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div
            className={`${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <i
              className={`ri-advertisement-line text-2xl ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-400'}`}
            ></i>
          </div>
          <p className={`${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay anuncios disponibles en este momento
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {otherUsersAds.map((ad) => (
            <div
              key={ad.id}
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow`}
            >
              {ad.imageUrl && (
                <div className="mb-4">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${ad.userRank === 'elite' ? 'bg-purple-100 text-purple-800' : ad.userRank === 'premium' ? 'bg-orange-100 text-orange-800' : ad.userRank === 'vip' ? 'bg-blue-100 text-blue-800' : ad.userRank === 'basico' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {ad.userRank.charAt(0).toUpperCase() + ad.userRank.slice(1)}
                  </span>
                  <span
                    className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    por {ad.userName}
                  </span>
                </div>
                <h4
                  className={`text-base sm:text-lg font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  {ad.title}
                </h4>
                <p
                  className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'} mb-3 line-clamp-3`}
                >
                  {ad.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs mb-3">
                <span
                  className={`${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {ad.viewsUsed.toLocaleString()}/{ad.maxViews.toLocaleString()} vistas
                </span>
                <div className="flex-1 mx-3">
                  <div
                    className={`${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'} w-full h-2 rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min((ad.viewsUsed / ad.maxViews) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {canClaimPoints(ad.id) ? (
                  <button
                    onClick={() => handleViewAd(ad)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                  >
                    <i className="ri-play-circle-line mr-2"></i>
                    Ver Anuncio
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-gray-600 py-2 rounded-lg cursor-not-allowed text-sm font-medium"
                  >
                    <i className="ri-time-line mr-2"></i>
                    Bloqueado 24h
                  </button>
                )}

                {!canClaimPoints(ad.id) && (
                  <div className="text-center">
                    <span
                      className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {getTimeUntilNextClaim(ad.id)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMisAnuncios = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3
          className={`text-lg sm:text-xl font-bold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Mis Anuncios
        </h3>
        {canCreateAd() && (
          <button
            onClick={() => setShowCreateAdForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm font-medium"
          >
            <i className="ri-add-line mr-2"></i>
            Crear Anuncio
          </button>
        )}
      </div>

      {/* Información del plan */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}
      >
        <h4
          className={`font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Plan {currentRankData?.name}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p
              className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Anuncios
            </p>
            <p className="text-base sm:text-lg font-bold text-blue-600">
              {simulationState.userAds.length}/{currentRankData?.adPackages || 0}
            </p>
          </div>
          <div>
            <p
              className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Visitas/Mes
            </p>
            <p className="text-base sm:text-lg font-bold text-green-600">
              {currentRankData?.monthlyVisits.toLocaleString() || 0}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p
              className={`text-xs ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Paquetes
            </p>
            <p className="text-base sm:text-lg font-bold text-purple-600">
              {currentRankData?.adPackages || 0}
            </p>
          </div>
        </div>
      </div>

      {simulationState.userAds.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div
            className={`${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <i
              className={`ri-advertisement-line text-2xl ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-400'}`}
            ></i>
          </div>
          <p className={`${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            No has creado anuncios aún
          </p>
          {canCreateAd() && (
            <button
              onClick={() => setShowCreateAdForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Crear Mi Primer Anuncio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {simulationState.userAds.map((ad) => (
            <div
              key={ad.id}
              className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-4 sm:p-6`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4
                  className={`text-base sm:text-lg font-semibold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  {ad.title}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {ad.isActive ? 'Activo' : 'Pausado'}
                </span>
              </div>

              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'} mb-3 line-clamp-2`}
              >
                {ad.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className={selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}>
                    Vistas utilizadas
                  </span>
                  <span className={selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}>
                    {ad.viewsUsed.toLocaleString()}/{ad.maxViews.toLocaleString()}
                  </span>
                </div>
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'} w-full h-2 rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min((ad.viewsUsed / ad.maxViews) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm text-center"
                >
                  Ver Enlace
                </a>
                <button
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${selectedTheme === 'oscuro' ? 'border-gray-500 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <i className="ri-edit-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSorteos = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3
          className={`text-lg sm:text-xl font-bold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Sorteos Activos
        </h3>
        <div className="flex items-center space-x-4">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTheme === 'oscuro' ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}`}
          >
            <i className="ri-star-line mr-1"></i>
            {simulationState.points} puntos
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTheme === 'oscuro' ? 'bg-purple-600 text-purple-100' : 'bg-purple-100 text-purple-800'}`}
          >
            <i className="ri-ticket-line mr-1"></i>
            {simulationState.lotteryEntries.length} participaciones
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {simulationState.activeLotteries.map((lottery) => (
          <div
            key={lottery.id}
            className={`bg-gradient-to-br ${lottery.type === 'semanal' ? (selectedTheme === 'oscuro' ? 'from-blue-800 to-blue-900 border-blue-600' : 'from-blue-50 to-blue-100 border-blue-200') : selectedTheme === 'oscuro' ? 'from-purple-800 to-purple-900 border-purple-600' : 'from-purple-50 to-purple-100 border-purple-200'} border rounded-xl p-4 sm:p-6`}
          >
            <div className="text-center mb-4">
              <div
                className={`w-16 h-16 ${lottery.type === 'semanal' ? 'bg-blue-500' : 'bg-purple-500'} rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <i className="ri-trophy-line text-2xl text-white"></i>
              </div>
              <h4
                className={`text-lg font-bold mb-2 ${lottery.type === 'semanal' ? (selectedTheme === 'oscuro' ? 'text-blue-300' : 'text-blue-800') : selectedTheme === 'oscuro' ? 'text-purple-300' : 'text-purple-800'}`}
              >
                Sorteo {lottery.type === 'semanal' ? 'Semanal' : 'Mensual'}
              </h4>
            </div>

            <div className="space-y-3 mb-6">
              <div
                className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-lg p-3 border text-center`}
              >
                <p
                  className={`text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Premio
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${lottery.prize.toLocaleString()} USD
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-lg p-3 border text-center`}
                >
                  <p
                    className={`text-xs font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Participantes
                  </p>
                  <p
                    className={`text-lg font-bold ${lottery.type === 'semanal' ? 'text-blue-600' : 'text-purple-600'}`}
                  >
                    {lottery.participants.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-lg p-3 border text-center`}
                >
                  <p
                    className={`text-xs font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Finaliza
                  </p>
                  <p
                    className={`text-sm font-bold ${lottery.type === 'semanal' ? 'text-blue-600' : 'text-purple-600'}`}
                  >
                    {new Date(lottery.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleEnterLottery(lottery.id, lottery.type)}
              disabled={simulationState.points < 50}
              className={`w-full py-3 rounded-lg font-semibold transition-all cursor-pointer ${simulationState.points >= 50 ? (lottery.type === 'semanal' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-purple-600 text-white hover:bg-purple-700') : 'bg-gray-400 text-gray-600 cursor-not-allowed'}`}
            >
              {simulationState.points >= 50 ? (
                <>
                  <i className="ri-ticket-line mr-2"></i>
                  Participar - 50 puntos
                </>
              ) : (
                'Puntos insuficientes'
              )}
            </button>

            {/* Mostrar participaciones del usuario */}
            {simulationState.lotteryEntries.some((entry) => entry.lotteryType === lottery.type) && (
              <div
                className={`mt-3 p-2 rounded-lg text-center text-sm ${selectedTheme === 'oscuro' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                <i className="ri-check-line mr-1"></i>
                Ya participas en este sorteo
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'} border rounded-xl p-4`}
      >
        <div className="flex items-start space-x-3">
          <i
            className={`ri-information-line text-lg mt-0.5 ${selectedTheme === 'oscuro' ? 'text-orange-400' : 'text-orange-600'}`}
          ></i>
          <div>
            <h4
              className={`font-semibold mb-2 ${selectedTheme === 'oscuro' ? 'text-orange-300' : 'text-orange-800'}`}
            >
              Cómo Funciona
            </h4>
            <ul
              className={`space-y-1 text-sm ${selectedTheme === 'oscuro' ? 'text-orange-200' : 'text-orange-700'}`}
            >
              <li>• Cada participación cuesta 50 puntos</li>
              <li>• Puedes participar múltiples veces para aumentar tus probabilidades</li>
              <li>• Los ganadores se anuncian automáticamente al finalizar</li>
              <li>• Los premios se depositan directamente en tu balance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal para crear anuncio
  const renderCreateAdModal = () =>
    showCreateAdForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={`${selectedTheme === 'oscuro' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className={`text-xl font-bold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
            >
              Crear Nuevo Anuncio
            </h3>
            <button
              onClick={() => setShowCreateAdForm(false)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${selectedTheme === 'oscuro' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Título del Anuncio *
              </label>
              <input
                type="text"
                value={adForm.title}
                onChange={(e) => setAdForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Curso de Marketing Digital"
                maxLength={100}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <p
                className={`text-xs mt-1 ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {adForm.title.length}/100 caracteres
              </p>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Descripción *
              </label>
              <textarea
                value={adForm.description}
                onChange={(e) => setAdForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe tu producto o servicio..."
                maxLength={300}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <p
                className={`text-xs mt-1 ${selectedTheme === 'oscuro' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {adForm.description.length}/300 caracteres
              </p>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                URL del Enlace *
              </label>
              <input
                type="url"
                value={adForm.url}
                onChange={(e) => setAdForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://ejemplo.com"
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                URL de Imagen (Opcional)
              </label>
              <input
                type="url"
                value={adForm.imageUrl}
                onChange={(e) => setAdForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${selectedTheme === 'oscuro' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateAdForm(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${selectedTheme === 'oscuro' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateAd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Crear Anuncio
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <h2
        className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
      >
        Publicidad de Miembros
      </h2>

      {/* Navegación de sub-secciones */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-2 mb-4 sm:mb-6`}
      >
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('ver-anuncios')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm cursor-pointer ${activeSubTab === 'ver-anuncios' ? 'bg-blue-600 text-white' : selectedTheme === 'oscuro' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <i className="ri-advertisement-line mr-2"></i>
            Ver Anuncios
          </button>

          {currentRankData && currentRankData.monthlyVisits > 0 && (
            <button
              onClick={() => setActiveSubTab('mis-anuncios')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm cursor-pointer ${activeSubTab === 'mis-anuncios' ? 'bg-blue-600 text-white' : selectedTheme === 'oscuro' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <i className="ri-dashboard-line mr-2"></i>
              Mis Anuncios
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('sorteos')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm cursor-pointer ${activeSubTab === 'sorteos' ? 'bg-blue-600 text-white' : selectedTheme === 'oscuro' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <i className="ri-trophy-line mr-2"></i>
            Sorteos
          </button>
        </div>
      </div>

      {/* Contenido de sub-secciones */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}
      >
        {activeSubTab === 'ver-anuncios' && renderVerAnuncios()}
        {activeSubTab === 'mis-anuncios' && renderMisAnuncios()}
        {activeSubTab === 'sorteos' && renderSorteos()}
      </div>

      {/* Modales */}
      {renderCreateAdModal()}
      {showAdViewPage && selectedAdForView && (
        <AdViewPage
          adId={selectedAdForView.id}
          adTitle={selectedAdForView.title}
          adUrl={selectedAdForView.url}
          selectedTheme={selectedTheme}
          onClose={handleAdViewClose}
          onPointsClaimed={handlePointsClaimed}
        />
      )}
    </div>
  );
}

export default PublicidadSection;
