'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Calculadora from './Calculadora';

interface Referido {
  name: string;
  rank: string;
  level: number;
  subReferidos: number;
}

interface PanelDeControlProps {
  timePeriod: string;
  setTimePeriod: (period: string) => void;
  referidos: Referido[];
  setActiveTab: (tab: string) => void;
  selectedTheme?: string;
}

function PanelDeControl({
  timePeriod = 'mensual',
  setTimePeriod,
  referidos = [],
  setActiveTab,
  selectedTheme = 'claro',
}: PanelDeControlProps) {
  const simulationData = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
      return {
        currentRank: userData.currentRank || 'registrado',
        balance: userData.balance || 6,
        referralCount: userData.referralCount || 2,
      };
    } catch (error) {
      return {
        currentRank: 'registrado',
        balance: 6,
        referralCount: 2,
      };
    }
  }, []);

  const chartData = useMemo(() => {
    const rankProgression: Record<
      string,
      { weeklyBase: number; monthlyBase: number; yearlyBase: number }
    > = {
      registrado: { weeklyBase: 25, monthlyBase: 400, yearlyBase: 5000 },
      invitado: { weeklyBase: 50, monthlyBase: 800, yearlyBase: 10000 },
      basico: { weeklyBase: 120, monthlyBase: 2000, yearlyBase: 25000 },
      vip: { weeklyBase: 600, monthlyBase: 10000, yearlyBase: 120000 },
      premium: { weeklyBase: 4800, monthlyBase: 80000, yearlyBase: 960000 },
      elite: { weeklyBase: 72000, monthlyBase: 1200000, yearlyBase: 14400000 },
    };

    const baseData = rankProgression[simulationData.currentRank] || rankProgression.registrado;

    return {
      weekly: [
        { name: 'Lun', ingresos: Math.floor(baseData.weeklyBase * 0.6) },
        { name: 'Mar', ingresos: Math.floor(baseData.weeklyBase * 1.2) },
        { name: 'Mié', ingresos: Math.floor(baseData.weeklyBase * 0.8) },
        { name: 'Jue', ingresos: Math.floor(baseData.weeklyBase * 1.8) },
        { name: 'Vie', ingresos: Math.floor(baseData.weeklyBase * 1.4) },
        { name: 'Sáb', ingresos: Math.floor(baseData.weeklyBase * 2.2) },
        { name: 'Dom', ingresos: Math.floor(baseData.weeklyBase * 1.0) },
      ],
      monthly: [
        { name: 'Ene', ingresos: Math.floor(baseData.monthlyBase * 0.8) },
        { name: 'Feb', ingresos: Math.floor(baseData.monthlyBase * 0.6) },
        { name: 'Mar', ingresos: Math.floor(baseData.monthlyBase * 1.3) },
        { name: 'Abr', ingresos: Math.floor(baseData.monthlyBase * 1.1) },
        { name: 'May', ingresos: Math.floor(baseData.monthlyBase * 1.8) },
        { name: 'Jun', ingresos: Math.floor(baseData.monthlyBase * 1.4) },
        { name: 'Jul', ingresos: Math.floor(baseData.monthlyBase * 1.6) },
        { name: 'Ago', ingresos: Math.floor(baseData.monthlyBase * 1.5) },
        { name: 'Sep', ingresos: Math.floor(baseData.monthlyBase * 2.0) },
        { name: 'Oct', ingresos: Math.floor(baseData.monthlyBase * 1.7) },
        { name: 'Nov', ingresos: Math.floor(baseData.monthlyBase * 1.9) },
        { name: 'Dic', ingresos: Math.floor(baseData.monthlyBase * 2.2) },
      ],
      yearly: [
        { name: '2020', ingresos: Math.floor(baseData.yearlyBase * 0.4) },
        { name: '2021', ingresos: Math.floor(baseData.yearlyBase * 0.6) },
        { name: '2022', ingresos: Math.floor(baseData.yearlyBase * 0.8) },
        { name: '2023', ingresos: Math.floor(baseData.yearlyBase * 1.0) },
        { name: '2024', ingresos: Math.floor(baseData.yearlyBase * 1.2) },
      ],
    };
  }, [simulationData.currentRank]);

  const referidosData = useMemo(() => {
    const currentRankIndex = [
      'registrado',
      'invitado',
      'basico',
      'vip',
      'premium',
      'elite',
    ].indexOf(simulationData.currentRank);

    const basePercentages = [20, 18, 16, 14, 16, 16];

    const adjustedPercentages = basePercentages.map((basePercent, index) => {
      if (index <= currentRankIndex) {
        return basePercent + (currentRankIndex - index) * 3;
      } else {
        return Math.max(basePercent - (index - currentRankIndex) * 2, 3);
      }
    });

    const total = adjustedPercentages.reduce((sum, val) => sum + val, 0);
    const normalizedPercentages = adjustedPercentages.map((val) => Math.round((val / total) * 100));

    const currentSum = normalizedPercentages.reduce((sum, val) => sum + val, 0);
    const difference = 100 - currentSum;
    normalizedPercentages[currentRankIndex] += difference;

    return [
      { name: 'Registrado', value: normalizedPercentages[0], color: '#6B7280' },
      { name: 'Invitado', value: normalizedPercentages[1], color: '#3B82F6' },
      { name: 'Básico', value: normalizedPercentages[2], color: '#10B981' },
      { name: 'VIP', value: normalizedPercentages[3], color: '#F59E0B' },
      { name: 'Premium', value: normalizedPercentages[4], color: '#8B5CF6' },
      { name: 'Elite', value: normalizedPercentages[5], color: '#EF4444' },
    ];
  }, [simulationData.currentRank]);

  const ventasRangos = useMemo(() => {
    const rankPrices: Record<string, number> = {
      registrado: 3,
      invitado: 5,
      basico: 10,
      vip: 50,
      premium: 400,
      elite: 6000,
    };

    const rankOrder = ['registrado', 'invitado', 'basico', 'vip', 'premium', 'elite'];
    const currentIndex = rankOrder.indexOf(simulationData.currentRank);

    return rankOrder.map((rank, index) => {
      const price = rankPrices[rank];
      let sales: number;

      if (index <= currentIndex) {
        sales =
          index === currentIndex
            ? simulationData.referralCount
            : Math.floor(simulationData.referralCount * (0.8 - index * 0.1));
      } else {
        sales = Math.floor(simulationData.referralCount * 0.3);
      }

      return {
        rango: rank.charAt(0).toUpperCase() + rank.slice(1),
        ventas: Math.max(sales, 1),
        precio: price,
        total: Math.max(sales, 1) * price,
        isCurrentRank: index === currentIndex,
        isAchieved: index <= currentIndex,
      };
    });
  }, [simulationData.currentRank, simulationData.referralCount]);

  const getChartData = useMemo(() => {
    return () => {
      switch (timePeriod) {
        case 'semanal':
          return chartData.weekly;
        case 'mensual':
          return chartData.monthly;
        case 'anual':
          return chartData.yearly;
        default:
          return chartData.monthly;
      }
    };
  }, [chartData, timePeriod]);

  const safeReferidos = Array.isArray(referidos) ? referidos : [];
  const referidosCount = simulationData.referralCount;

  const totalIngresos = useMemo(() => simulationData.balance, [simulationData.balance]);
  const totalVentas = useMemo(
    () => ventasRangos.reduce((sum, venta) => sum + venta.ventas, 0),
    [ventasRangos]
  );

  const handleTimePeriodChange = (period: string): void => {
    if (typeof setTimePeriod === 'function') {
      setTimePeriod(period);
    }
  };

  const handleActiveTabChange = (tab: string): void => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tab);
    }
  };

  const getRankDisplayName = (rank: string): string => {
    const rankNames: Record<string, string> = {
      registrado: 'Registrado',
      invitado: 'Invitado',
      basico: 'Básico',
      vip: 'VIP',
      premium: 'Premium',
      elite: 'Elite',
    };
    return rankNames[rank] || 'Registrado';
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <h2
          className={`text-xl sm:text-2xl font-bold ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Panel de Control
        </h2>
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={() => handleTimePeriodChange('semanal')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              timePeriod === 'semanal'
                ? 'bg-blue-600 text-white'
                : selectedTheme === 'oscuro'
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => handleTimePeriodChange('mensual')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              timePeriod === 'mensual'
                ? 'bg-blue-600 text-white'
                : selectedTheme === 'oscuro'
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => handleTimePeriodChange('anual')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              timePeriod === 'anual'
                ? 'bg-blue-600 text-white'
                : selectedTheme === 'oscuro'
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      {/* Statistics Cards con tema oscuro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div
          className={`bg-gradient-to-br ${selectedTheme === 'oscuro' ? 'from-blue-800 to-blue-900 border-blue-600' : 'from-blue-50 to-blue-100 border-blue-200'} p-4 sm:p-6 rounded-xl border`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-lg sm:text-xl text-white"></i>
            </div>
            <span
              className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-blue-300' : 'text-blue-600'}`}
            >
              Real
            </span>
          </div>
          <h3
            className={`text-xs sm:text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Ingresos Totales
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            ${totalIngresos.toLocaleString()}
          </p>
        </div>

        <div
          className={`bg-gradient-to-br ${selectedTheme === 'oscuro' ? 'from-green-800 to-green-900 border-green-600' : 'from-green-50 to-green-100 border-green-200'} p-4 sm:p-6 rounded-xl border`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-shopping-bag-line text-lg sm:text-xl text-white"></i>
            </div>
            <span
              className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-green-300' : 'text-green-600'}`}
            >
              Actual
            </span>
          </div>
          <h3
            className={`text-xs sm:text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Ventas Totales
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{totalVentas}</p>
        </div>

        <div
          className={`bg-gradient-to-br ${selectedTheme === 'oscuro' ? 'from-purple-800 to-purple-900 border-purple-600' : 'from-purple-50 to-purple-100 border-purple-200'} p-4 sm:p-6 rounded-xl border`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <i className="ri-group-line text-lg sm:text-xl text-white"></i>
            </div>
            <span
              className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-purple-300' : 'text-purple-600'}`}
            >
              Activos
            </span>
          </div>
          <h3
            className={`text-xs sm:text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Referidos Activos
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">{referidosCount}</p>
        </div>

        <div
          className={`bg-gradient-to-br ${selectedTheme === 'oscuro' ? 'from-orange-800 to-orange-900 border-orange-600' : 'from-orange-50 to-orange-100 border-orange-200'} p-4 sm:p-6 rounded-xl border`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <i className="ri-star-line text-lg sm:text-xl text-white"></i>
            </div>
            <span
              className={`text-xs font-medium ${selectedTheme === 'oscuro' ? 'text-orange-300' : 'text-orange-600'}`}
            >
              Nivel{' '}
              {simulationData.currentRank === 'registrado'
                ? '1'
                : simulationData.currentRank === 'invitado'
                  ? '2'
                  : simulationData.currentRank === 'basico'
                    ? '3'
                    : simulationData.currentRank === 'vip'
                      ? '4'
                      : simulationData.currentRank === 'premium'
                        ? '5'
                        : '6'}
            </span>
          </div>
          <h3
            className={`text-xs sm:text-sm font-medium mb-1 ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Rango Actual
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-orange-600">
            {getRankDisplayName(simulationData.currentRank)}
          </p>
        </div>
      </div>

      {/* Chart Section con tema oscuro */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}
      >
        <h3
          className={`text-base sm:text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Evolución de Ingresos - {getRankDisplayName(simulationData.currentRank)}
        </h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={selectedTheme === 'oscuro' ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: selectedTheme === 'oscuro' ? '#9CA3AF' : '#6B7280' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: selectedTheme === 'oscuro' ? '#9CA3AF' : '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: selectedTheme === 'oscuro' ? '#374151' : '#ffffff',
                  border: `1px solid ${selectedTheme === 'oscuro' ? '#6B7280' : '#e5e7eb'}`,
                  color: selectedTheme === 'oscuro' ? '#F3F4F6' : '#1F2937',
                }}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid con tema oscuro */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div
          className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}
        >
          <h3
            className={`text-base sm:text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
          >
            Distribución de Referidos por Rango (Total: 100%)
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={referidosData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {referidosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Porcentaje']}
                  contentStyle={{
                    backgroundColor: selectedTheme === 'oscuro' ? '#374151' : '#ffffff',
                    border: `1px solid ${selectedTheme === 'oscuro' ? '#6B7280' : '#e5e7eb'}`,
                    color: selectedTheme === 'oscuro' ? '#F3F4F6' : '#1F2937',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div
              className={`text-xs rounded px-2 py-1 inline-block ${selectedTheme === 'oscuro' ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'}`}
            >
              Total: {referidosData.reduce((sum, item) => sum + item.value, 0)}%
            </div>
          </div>
        </div>

        <Calculadora selectedTheme={selectedTheme} />
      </div>

      {/* Sales Table con tema oscuro */}
      <div
        className={`${selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}
      >
        <h3
          className={`text-base sm:text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Resumen de Ventas por Rango Actual
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr
                className={`border-b ${selectedTheme === 'oscuro' ? 'border-gray-600' : 'border-gray-200'}`}
              >
                <th
                  className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Rango
                </th>
                <th
                  className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Ventas
                </th>
                <th
                  className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Precio Unit.
                </th>
                <th
                  className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Total
                </th>
                <th
                  className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {ventasRangos.map((venta, index) => (
                <tr
                  key={index}
                  className={`border-b transition-colors ${
                    selectedTheme === 'oscuro' ? 'border-gray-700' : 'border-gray-100'
                  } ${
                    venta.isCurrentRank
                      ? selectedTheme === 'oscuro'
                        ? 'bg-blue-900/30'
                        : 'bg-blue-50'
                      : venta.isAchieved
                        ? selectedTheme === 'oscuro'
                          ? 'bg-green-900/30'
                          : 'bg-green-50'
                        : selectedTheme === 'oscuro'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                  }`}
                >
                  <td
                    className={`py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${
                      venta.isCurrentRank
                        ? selectedTheme === 'oscuro'
                          ? 'text-blue-300'
                          : 'text-blue-800'
                        : venta.isAchieved
                          ? selectedTheme === 'oscuro'
                            ? 'text-green-300'
                            : 'text-green-800'
                          : selectedTheme === 'oscuro'
                            ? 'text-gray-300'
                            : 'text-gray-800'
                    }`}
                  >
                    {venta.rango}
                    {venta.isCurrentRank && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        Actual
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    {venta.ventas}
                  </td>
                  <td
                    className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    ${venta.precio}
                  </td>
                  <td
                    className={`py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm ${
                      venta.isAchieved
                        ? 'text-green-600'
                        : selectedTheme === 'oscuro'
                          ? 'text-gray-500'
                          : 'text-gray-400'
                    }`}
                  >
                    ${venta.total.toLocaleString()}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        venta.isAchieved
                          ? selectedTheme === 'oscuro'
                            ? 'bg-green-800 text-green-200'
                            : 'bg-green-100 text-green-800'
                          : selectedTheme === 'oscuro'
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {venta.isAchieved ? 'Completado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Section con tema oscuro */}
      <div
        className={`bg-gradient-to-r ${selectedTheme === 'oscuro' ? 'from-gray-800 to-gray-700 border-gray-600' : 'from-blue-50 to-purple-50 border-blue-200'} rounded-xl p-4 sm:p-6 border`}
      >
        <h3
          className={`text-base sm:text-lg font-semibold mb-4 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
        >
          Progreso de Rango
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {simulationData.currentRank === 'registrado'
                  ? '1'
                  : simulationData.currentRank === 'invitado'
                    ? '2'
                    : simulationData.currentRank === 'basico'
                      ? '3'
                      : simulationData.currentRank === 'vip'
                        ? '4'
                        : simulationData.currentRank === 'premium'
                          ? '5'
                          : '6'}
              </span>
            </div>
            <div>
              <p
                className={`font-medium text-sm sm:text-base ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                Nivel Actual: {getRankDisplayName(simulationData.currentRank)}
              </p>
              <p
                className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Balance: ${simulationData.balance} USD
              </p>
            </div>
          </div>
          {simulationData.currentRank !== 'elite' && (
            <div className="flex items-center space-x-3">
              <div className="text-right sm:order-last">
                <p
                  className={`font-medium text-sm sm:text-base ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
                >
                  Próximo Objetivo
                </p>
                <p
                  className={`text-xs sm:text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {simulationData.currentRank === 'registrado'
                    ? 'Invitado - $5'
                    : simulationData.currentRank === 'invitado'
                      ? 'Básico - $10'
                      : simulationData.currentRank === 'basico'
                        ? 'VIP - $50'
                        : simulationData.currentRank === 'vip'
                          ? 'Premium - $400'
                          : simulationData.currentRank === 'premium'
                            ? 'Elite - $6000'
                            : 'Elite Max'}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {simulationData.currentRank === 'registrado'
                    ? '2'
                    : simulationData.currentRank === 'invitado'
                      ? '3'
                      : simulationData.currentRank === 'basico'
                        ? '4'
                        : simulationData.currentRank === 'vip'
                          ? '5'
                          : simulationData.currentRank === 'premium'
                            ? '6'
                            : '6'}
                </span>
              </div>
            </div>
          )}

          {simulationData.currentRank !== 'elite' && (
            <>
              <div
                className={`w-full rounded-full h-2 sm:h-3 mb-4 ${selectedTheme === 'oscuro' ? 'bg-gray-600' : 'bg-gray-200'}`}
              >
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 sm:h-3 rounded-full"
                  style={{
                    width:
                      simulationData.currentRank === 'registrado'
                        ? '16%'
                        : simulationData.currentRank === 'invitado'
                          ? '33%'
                          : simulationData.currentRank === 'basico'
                            ? '50%'
                            : simulationData.currentRank === 'vip'
                              ? '66%'
                              : simulationData.currentRank === 'premium'
                                ? '83%'
                                : '100%',
                  }}
                />
              </div>
              <div className="text-center">
                <button
                  onClick={() => handleActiveTabChange('ascender')}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base"
                >
                  Ascender Ahora
                </button>
              </div>
            </>
          )}

          {simulationData.currentRank === 'elite' && (
            <div
              className={`text-center rounded-lg p-4 ${selectedTheme === 'oscuro' ? 'bg-gradient-to-r from-yellow-800 to-orange-800' : 'bg-gradient-to-r from-yellow-100 to-orange-100'}`}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-vip-crown-line text-white text-xl"></i>
              </div>
              <h4
                className={`font-bold mb-1 ${selectedTheme === 'oscuro' ? 'text-white' : 'text-gray-800'}`}
              >
                ¡Rango Elite Alcanzado!
              </h4>
              <p
                className={`text-sm ${selectedTheme === 'oscuro' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Has alcanzado el máximo nivel de la plataforma
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PanelDeControl;
