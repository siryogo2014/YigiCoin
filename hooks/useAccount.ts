'use client';

import { useState, useCallback } from 'react';

interface AccountData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  paypalEmail: string;
  metamaskAddress: string;
}

interface AccountActions {
  updateAccountData: (field: keyof AccountData, value: string) => void;
  resetAccountData: () => void;
  validateAccountData: () => { isValid: boolean; errors: string[] };
  sanitizeInput: (input: string) => string;
}

const initialAccountData: AccountData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  paypalEmail: '',
  metamaskAddress: '',
};

export const useAccount = (): AccountData & AccountActions => {
  const [accountData, setAccountData] = useState<AccountData>(initialAccountData);

  const sanitizeInput = useCallback((input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  }, []);

  const updateAccountData = useCallback(
    (field: keyof AccountData, value: string) => {
      setAccountData((prev) => ({
        ...prev,
        [field]: sanitizeInput(value),
      }));
    },
    [sanitizeInput]
  );

  const resetAccountData = useCallback(() => {
    setAccountData(initialAccountData);
  }, []);

  const validateAccountData = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!accountData.currentPassword) {
      errors.push('Debes ingresar tu contraseña actual');
    }

    if (accountData.newPassword && accountData.newPassword.length < 8) {
      errors.push('La nueva contraseña debe tener al menos 8 caracteres');
    }

    if (accountData.newPassword && accountData.newPassword !== accountData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }

    if (accountData.paypalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.paypalEmail)) {
      errors.push('El email de PayPal no es válido');
    }

    if (accountData.metamaskAddress && !/^0x[a-fA-F0-9]{40}$/.test(accountData.metamaskAddress)) {
      errors.push('La dirección de MetaMask no es válida');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [accountData]);

  return {
    ...accountData,
    updateAccountData,
    resetAccountData,
    validateAccountData,
    sanitizeInput,
  };
};
