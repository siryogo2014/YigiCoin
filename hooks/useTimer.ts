'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  timer: number;
  penaltyTimer: number;
  reactivationTimer: number;
  penaltyPrice: number;
  isPageBlocked: boolean;
  showFloatingTimer: boolean;
  // NUEVO: Estado para el cooldown del botón actualizar
  updateButtonCooldown: number;
  isUpdateButtonDisabled: boolean;
}

interface TimerActions {
  resetTimer: () => void;
  updateTimer: () => void;
  addTime: (seconds: number) => void; // NUEVO: Función para agregar tiempo
  setShowFloatingTimer: (show: boolean) => void;
  setPenaltyPrice: (price: number) => void;
  setIsPageBlocked: (blocked: boolean) => void;
  formatTimer: (seconds: number) => string;
  formatPenaltyTimer: (seconds: number) => string;
  formatReactivationTimer: (seconds: number) => string;
}

export const useTimer = (initialTimer: number = 180): TimerState & TimerActions => {
  // 3 minutos (180 segundos)
  const [timer, setTimer] = useState(initialTimer);
  const [penaltyTimer, setPenaltyTimer] = useState(172800); // 48 horas
  const [reactivationTimer, setReactivationTimer] = useState(60); // CAMBIADO: 1 minuto (60 segundos)
  const [penaltyPrice, setPenaltyPrice] = useState(5); // CAMBIADO: Precio inicial $5 USD
  const [isPageBlocked, setIsPageBlocked] = useState(false);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [mounted, setMounted] = useState(false);

  // NUEVO: Estados para el cooldown del botón actualizar
  const [updateButtonCooldown, setUpdateButtonCooldown] = useState(0);
  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(false);

  // Refs para los intervalos
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const penaltyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reactivationTimerRef = useRef<NodeJS.Timeout | null>(null);
  // NUEVO: Ref para el cooldown del botón
  const updateCooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialización única
  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);
      if (reactivationTimerRef.current) clearInterval(reactivationTimerRef.current);
      if (updateCooldownRef.current) clearInterval(updateCooldownRef.current);
    };
  }, []);

  // Timer principal - CORREGIDO: Sin dependencias que causen bucles
  useEffect(() => {
    if (!mounted) return;

    // Limpiar timer anterior
    if (timerRef.current) clearInterval(timerRef.current);

    // Solo iniciar timer si es mayor a 0
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev - 1;

          // Mostrar timer flotante cuando queden 60 segundos (1 minuto)
          if (newTimer === 60) {
            setShowFloatingTimer(true);
          }

          // Bloquear página cuando llegue a 0
          if (newTimer === 0) {
            setIsPageBlocked(true);
            setShowFloatingTimer(false);
          }

          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted, timer]); // Solo depende de mounted y timer

  // NUEVO: Timer para el cooldown del botón actualizar
  useEffect(() => {
    if (!mounted || updateButtonCooldown === 0) return;

    if (updateCooldownRef.current) clearInterval(updateCooldownRef.current);

    updateCooldownRef.current = setInterval(() => {
      setUpdateButtonCooldown((prev) => {
        const newCooldown = prev - 1;
        if (newCooldown === 0) {
          setIsUpdateButtonDisabled(false);
        }
        return newCooldown;
      });
    }, 1000);

    return () => {
      if (updateCooldownRef.current) clearInterval(updateCooldownRef.current);
    };
  }, [mounted, updateButtonCooldown]);

  // Timer de penalización - CORREGIDO: Solo cuando la página está bloqueada
  useEffect(() => {
    if (!mounted || !isPageBlocked) return;

    // Limpiar timer anterior
    if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);

    if (penaltyTimer > 0) {
      penaltyTimerRef.current = setInterval(() => {
        setPenaltyTimer((prev) => {
          const newPenaltyTimer = prev - 1;
          if (newPenaltyTimer === 0) {
            setPenaltyPrice(50); // Aumenta la multa después de 48 horas
          }
          return newPenaltyTimer;
        });
      }, 1000);
    }

    return () => {
      if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);
    };
  }, [mounted, isPageBlocked, penaltyTimer]);

  // Timer de reactivación - CORREGIDO: Solo cuando la página está bloqueada
  useEffect(() => {
    if (!mounted || !isPageBlocked) return;

    // Limpiar timer anterior
    if (reactivationTimerRef.current) clearInterval(reactivationTimerRef.current);

    if (reactivationTimer > 0) {
      reactivationTimerRef.current = setInterval(() => {
        setReactivationTimer((prev) => {
          const newReactivationTimer = prev - 1;
          // CAMBIADO: Cuando el tiempo de reactivación llega a 0, cambiar precio a $20
          if (newReactivationTimer === 0) {
            setPenaltyPrice(20);
          }
          return newReactivationTimer;
        });
      }, 1000);
    }

    return () => {
      if (reactivationTimerRef.current) clearInterval(reactivationTimerRef.current);
    };
  }, [mounted, isPageBlocked, reactivationTimer]);

  // Función para resetear el timer (limpia todo)
  const resetTimer = useCallback(() => {
    // Limpiar todos los timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);
    if (reactivationTimerRef.current) clearInterval(reactivationTimerRef.current);

    setTimer(initialTimer);
    setShowFloatingTimer(false);
    setIsPageBlocked(false);
    setPenaltyTimer(172800);
    setReactivationTimer(60); // CAMBIADO: Resetear a 1 minuto
    setPenaltyPrice(5); // CAMBIADO: Resetear a $5 USD
  }, [initialTimer]);

  // FUNCIÓN MEJORADA: Actualizar contador con cooldown de 1 minuto
  const updateTimer = useCallback(() => {
    // Si el botón está en cooldown, no hacer nada
    if (isUpdateButtonDisabled) return;

    // Limpiar solo el timer principal
    if (timerRef.current) clearInterval(timerRef.current);

    // Reiniciar estados relacionados con el timer principal
    setTimer(initialTimer);
    setShowFloatingTimer(false);

    // Si la página estaba bloqueada, la desbloqueamos
    if (isPageBlocked) {
      setIsPageBlocked(false);
      // Limpiar también los timers de penalización
      if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);
      if (reactivationTimerRef.current) clearInterval(reactivationTimerRef.current);
    }

    // NUEVO: Activar cooldown de 60 segundos (1 minuto)
    setUpdateButtonCooldown(60);
    setIsUpdateButtonDisabled(true);

    // El timer se reiniciará automáticamente por el useEffect
  }, [initialTimer, isPageBlocked, isUpdateButtonDisabled]);

  // NUEVA: Función para agregar tiempo al contador actual
  const addTime = useCallback(
    (seconds: number) => {
      // Limpiar timer actual
      if (timerRef.current) clearInterval(timerRef.current);

      // Sumar tiempo al timer actual
      setTimer((prev) => prev + seconds);

      // Si la página estaba bloqueada, desbloquearla
      if (isPageBlocked) {
        setIsPageBlocked(false);
        setShowFloatingTimer(false);

        // Limpiar timers de penalización
        if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);
        if (reactivationTimerRef.current) clearInterval(reactivationTimerRef.current);
      }

      // El timer se reiniciará automáticamente con el nuevo valor por el useEffect
    },
    [isPageBlocked]
  );

  const formatTimer = useCallback((seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatPenaltyTimer = useCallback((seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // CAMBIADO: Formatear timer de reactivación para mostrar solo minutos y segundos
  const formatReactivationTimer = useCallback((seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timer,
    penaltyTimer,
    reactivationTimer,
    penaltyPrice,
    isPageBlocked,
    showFloatingTimer,
    // NUEVO: Retornar estados del cooldown
    updateButtonCooldown,
    isUpdateButtonDisabled,
    resetTimer,
    updateTimer,
    addTime, // NUEVO: Función para agregar tiempo
    setShowFloatingTimer,
    setPenaltyPrice,
    setIsPageBlocked,
    formatTimer,
    formatPenaltyTimer,
    formatReactivationTimer,
  };
};
