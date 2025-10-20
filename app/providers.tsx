// app/providers.tsx
'use client';

import * as React from 'react';
import {
  SimulationContext,
  SimulationContextValue,
  makeInitialSimulationState,
  RANKS,
  RANK_ORDER,
  RankId,
  Ad,
} from '../hooks/useSimulation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState(makeInitialSimulationState());

  // ===== Implementación mínima estable =====
  const getCurrentRankData = () => RANKS[state.currentRank];
  const getNextRankData = () => {
    const i = RANK_ORDER.indexOf(state.currentRank);
    return i >= 0 && i + 1 < RANK_ORDER.length ? RANKS[RANK_ORDER[i + 1]] : null;
    };
  const canUpgrade = () => !!getNextRankData();
  const upgradeToRank = (rankId: RankId) => {
    if (!RANKS[rankId]) return false;
    setState((s) => ({ ...s, currentRank: rankId }));
    return true;
  };

  const markNotificationAsRead = (id: number) => {
    setState((s) => {
      const ns = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { ...s, notifications: ns, unreadCount: ns.filter((n) => !n.read).length };
    });
  };

  const markAllNotificationsAsRead = () =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 }));

  const useTotem = () => true;
  const usePointsForTimeExtension = (_mins: number) => {};
  const usePointsForTimerUpdate = (_mins: number) => {};

  const createUserAd: SimulationContextValue['createUserAd'] = (adInput) => {
    setState((s) => {
      const newAd: Ad = {
        id: `ad_${Date.now()}`,
        userId: 'current_user',
        userName: 'Usuario',
        userRank: s.currentRank,
        title: adInput.title,
        description: adInput.description,
        url: adInput.url,
        imageUrl: adInput.imageUrl,
        createdAt: new Date().toISOString(),
        viewsUsed: 0,
        maxViews: 1000,
        isActive: true,
      };
      return { ...s, userAds: [newAd, ...s.userAds] };
    });
    return true;
  };

  const enterLottery: SimulationContextValue['enterLottery'] = (lotteryId, type) => {
    setState((s) => {
      if (s.lotteryEntries.some((e) => e.lotteryId === lotteryId)) return s;
      return {
        ...s,
        lotteryEntries: [{ lotteryId, lotteryType: type, userId: 'current_user', timestamp: new Date().toISOString() }, ...s.lotteryEntries],
        points: Math.max(0, s.points - 50),
      };
    });
    return true;
  };

  const claimAdPoints: SimulationContextValue['claimAdPoints'] = (adId) => {
    let ok = false;
    setState((s) => {
      const view = s.adViews.find((v) => v.adId === adId && v.userId === 'current_user');
      const now = Date.now();
      if (view && new Date(view.nextClaimTime).getTime() > now) return s;
      if (view) {
        ok = true;
        return {
          ...s,
          adViews: s.adViews.map((v) =>
            v === view
              ? { ...v, lastViewTime: new Date().toISOString(), nextClaimTime: new Date(now + 24 * 3600_000).toISOString() }
              : v
          ),
          points: s.points + 5,
        };
      }
      ok = true;
      return {
        ...s,
        adViews: [{ adId, userId: 'current_user', lastViewTime: new Date().toISOString(), nextClaimTime: new Date(now + 24 * 3600_000).toISOString() }, ...s.adViews],
        points: s.points + 5,
      };
    });
    return ok;
  };

  const value = React.useMemo<SimulationContextValue>(() => ({
    simulationState: state,
    upgradeToRank,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getCurrentRankData,
    getNextRankData,
    canUpgrade,
    useTotem,
    usePointsForTimeExtension,
    usePointsForTimerUpdate,
    createUserAd,
    enterLottery,
    claimAdPoints,
    RANKS,
  }), [state]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}
