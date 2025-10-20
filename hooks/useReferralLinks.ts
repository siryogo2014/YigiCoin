'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ReferralLink {
  id: string;
  code: string;
  url: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  createdBy: string;
}

export interface Referral {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
  referredBy: string;
}

// CORREGIDO 4: Función para detectar automáticamente el usuario actual desde localStorage
const detectCurrentUserId = (): string => {
  try {
    const userData = JSON.parse(localStorage.getItem('user_simulation_data') || '{}');
    return userData.id || `user_${Date.now()}`;
  } catch {
    return `user_${Date.now()}`;
  }
};

export const useReferralLinks = (providedUserId?: string) => {
  // CORREGIDO 4: Usar ID proporcionado o detectar automáticamente
  const [userId] = useState(() => providedUserId || detectCurrentUserId());
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [mounted, setMounted] = useState(false);

  // Límites por nivel
  const levelLimits = {
    1: { maxReferrals: 2, price: 3 },
    2: { maxReferrals: 4, price: 5 },
    3: { maxReferrals: 8, price: 10 },
    4: { maxReferrals: 16, price: 50 },
    5: { maxReferrals: 32, price: 400 },
    6: { maxReferrals: 64, price: 6000 },
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = useCallback(() => {
    try {
      const savedLinks = localStorage.getItem('referral_links');
      const savedReferrals = localStorage.getItem('referrals');

      if (savedLinks) {
        const links = JSON.parse(savedLinks).map((link: any) => ({
          ...link,
          usedAt: link.usedAt ? new Date(link.usedAt) : undefined,
        }));
        setReferralLinks(links);
      }

      if (savedReferrals) {
        const referralsData = JSON.parse(savedReferrals).map((ref: any) => ({
          ...ref,
          registeredAt: new Date(ref.registeredAt),
        }));
        setReferrals(referralsData);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  }, []);

  const saveData = useCallback(() => {
    try {
      localStorage.setItem('referral_links', JSON.stringify(referralLinks));
      localStorage.setItem('referrals', JSON.stringify(referrals));
    } catch (error) {
      console.error('Error saving referral data:', error);
    }
  }, [referralLinks, referrals]);

  useEffect(() => {
    if (mounted) {
      saveData();
    }
  }, [mounted, saveData]);

  const generateInitialLinks = useCallback(() => {
    const userLevel = 1; // Por defecto nivel 1
    const maxLinks = levelLimits[userLevel].maxReferrals;

    const existingUserLinks = referralLinks.filter((link) => link.createdBy === userId);
    const linksToGenerate = Math.max(0, maxLinks - existingUserLinks.length);

    if (linksToGenerate === 0) return;

    const newLinks: ReferralLink[] = [];

    for (let i = 0; i < linksToGenerate; i++) {
      const linkId = `${userId}_${Date.now()}_${i}`;
      const referralCode = `ref-${linkId}`;

      newLinks.push({
        id: linkId,
        code: referralCode,
        url: `${window.location.origin}/registro?ref=${referralCode}`,
        isUsed: false,
        createdBy: userId,
      });
    }

    setReferralLinks((prev) => [...prev, ...newLinks]);
  }, [userId, referralLinks]);

  const validateLink = useCallback(
    (refCode: string) => {
      const link = referralLinks.find((link) => link.code === refCode);

      if (!link) {
        return { isValid: false, referrerId: null, error: 'Enlace no encontrado' };
      }

      if (link.isUsed) {
        return { isValid: false, referrerId: null, error: 'Enlace ya utilizado' };
      }

      return { isValid: true, referrerId: link.createdBy, error: null };
    },
    [referralLinks]
  );

  const useLink = useCallback(
    (refCode: string, newUserId: string, userData: any): boolean => {
      const linkIndex = referralLinks.findIndex((link) => link.code === refCode);

      if (linkIndex === -1 || referralLinks[linkIndex].isUsed) {
        return false;
      }

      // Marcar enlace como usado
      const updatedLinks = [...referralLinks];
      updatedLinks[linkIndex] = {
        ...updatedLinks[linkIndex],
        isUsed: true,
        usedBy: newUserId,
        usedAt: new Date(),
      };

      // Crear nuevo referido
      const newReferral: Referral = {
        id: newUserId,
        name: userData.name || 'Usuario',
        email: userData.email || 'sin-email@ejemplo.com',
        registeredAt: new Date(),
        referredBy: updatedLinks[linkIndex].createdBy,
      };

      setReferralLinks(updatedLinks);
      setReferrals((prev) => [...prev, newReferral]);

      return true;
    },
    [referralLinks]
  );

  const invalidateLink = useCallback(
    (linkId: string) => {
      const updatedLinks = referralLinks.map((link) =>
        link.id === linkId
          ? { ...link, isUsed: true, usedBy: 'INVALIDATED', usedAt: new Date() }
          : link
      );
      setReferralLinks(updatedLinks);
    },
    [referralLinks]
  );

  const getUserLinks = useCallback(() => {
    return referralLinks.filter((link) => link.createdBy === userId);
  }, [referralLinks, userId]);

  const getAvailableLinks = useCallback(() => {
    return referralLinks.filter((link) => link.createdBy === userId && !link.isUsed);
  }, [referralLinks, userId]);

  const getUserReferrals = useCallback(() => {
    return referrals.filter((referral) => referral.referredBy === userId);
  }, [referrals, userId]);

  const canGenerateMoreLinks = useCallback(() => {
    const userLevel = 1; // Por defecto nivel 1
    const maxLinks = levelLimits[userLevel].maxReferrals;
    const currentLinks = getUserLinks().length;
    return currentLinks < maxLinks;
  }, [getUserLinks]);

  return {
    mounted,
    referralLinks,
    referrals,
    generateInitialLinks,
    validateLink,
    useLink,
    invalidateLink,
    getUserLinks,
    getAvailableLinks,
    getUserReferrals,
    canGenerateMoreLinks,
    userId,
  };
};
