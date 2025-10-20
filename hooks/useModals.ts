'use client';

import { useState, useCallback } from 'react';

interface ModalState {
  showPayment: boolean;
  showUserMenu: boolean;
  showPaymentOptions: boolean;
  showPayPalModal: boolean;
  showExplanationModal: boolean;
  showTimerModal: boolean;
  showPenaltyModal: boolean;
  showInfoModal: boolean;
  showZeroTimeModal: boolean;
  showTimePaymentModal: boolean;
  showPenaltyPaymentModal: boolean;
  showAccountModal: boolean;
  showSupportChat: boolean;
  explanationContent: string;
  selectedTimePackage: string | null;
}

interface ModalActions {
  openModal: (modalName: keyof ModalState) => void;
  closeModal: (modalName: keyof ModalState) => void;
  closeAllModals: () => void;
  showExplanation: (content: string) => void;
  setSelectedTimePackage: (packageType: string | null) => void;
}

const initialState: ModalState = {
  showPayment: false,
  showUserMenu: false,
  showPaymentOptions: false,
  showPayPalModal: false,
  showExplanationModal: false,
  showTimerModal: false,
  showPenaltyModal: false,
  showInfoModal: false,
  showZeroTimeModal: false,
  showTimePaymentModal: false,
  showPenaltyPaymentModal: false,
  showAccountModal: false,
  showSupportChat: false,
  explanationContent: '',
  selectedTimePackage: null,
};

export const useModals = (): ModalState & ModalActions => {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const openModal = useCallback((modalName: keyof ModalState) => {
    setModalState((prev) => ({
      ...prev,
      [modalName]: true,
    }));
  }, []);

  const closeModal = useCallback((modalName: keyof ModalState) => {
    setModalState((prev) => ({
      ...prev,
      [modalName]: false,
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalState(initialState);
  }, []);

  const showExplanation = useCallback((content: string) => {
    setModalState((prev) => ({
      ...prev,
      explanationContent: content,
      showExplanationModal: true,
    }));
  }, []);

  const setSelectedTimePackage = useCallback((packageType: string | null) => {
    setModalState((prev) => ({
      ...prev,
      selectedTimePackage: packageType,
    }));
  }, []);

  return {
    ...modalState,
    openModal,
    closeModal,
    closeAllModals,
    showExplanation,
    setSelectedTimePackage,
  };
};
