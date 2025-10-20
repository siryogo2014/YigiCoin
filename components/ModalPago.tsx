'use client';

import React from 'react';
import PaymentProcessor from './payments/PaymentProcessor';

interface MembershipData {
  currentLevel: string;
  nextLevel: string;
  benefits: string[];
}

interface PaymentDetails {
  amount: number;
  orderID?: string;
  transactionHash?: string;
  userData?: Record<string, unknown>;
  successMessage?: string;
}

interface ModalPagoProps {
  show: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  description?: string;
  paymentType?: 'registro' | 'membresia' | 'multa' | 'tiempo';
  userId?: string;
  onPaymentSuccess?: (details: PaymentDetails) => void;
  onPaymentError?: (error: Record<string, unknown>) => void;
  membershipData?: MembershipData;
  showMetaMask?: boolean;
}

function ModalPago({
  show = false,
  onClose,
  title = 'Pago',
  amount = 0,
  description = '',
  paymentType = 'membresia',
  userId = 'user_demo',
  onPaymentSuccess,
  onPaymentError,
  membershipData,
  showMetaMask = true,
}: ModalPagoProps) {
  const handlePaymentSuccess = (paymentDetails: PaymentDetails): void => {
    const successMessage = `¡Pago exitoso! Has ascendido al siguiente nivel.`;

    const userData = {
      level: membershipData?.nextLevel || 'Invitado',
      payment: {
        amount: paymentDetails.amount,
        transactionId: paymentDetails.orderID || paymentDetails.transactionHash,
        method: paymentDetails.orderID ? 'PayPal' : 'MetaMask',
        date: new Date().toISOString(),
      },
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_payment_success', JSON.stringify(userData));
    }

    if (typeof onPaymentSuccess === 'function') {
      onPaymentSuccess({
        ...paymentDetails,
        userData,
        successMessage,
      });
    } else {
      alert(successMessage);
    }

    onClose();
  };

  const handlePaymentError = (error: Record<string, unknown>): void => {
    let errorMessage = 'Error al procesar el pago. Por favor, intenta nuevamente.';

    if (error.message && typeof error.message === 'string') {
      errorMessage = error.message;
    } else if (error.code === 4001) {
      errorMessage = 'Pago cancelado por el usuario.';
    }

    if (typeof onPaymentError === 'function') {
      onPaymentError({
        ...error,
        errorMessage,
      });
    } else {
      alert(errorMessage);
    }
  };

  const handlePaymentCancel = (): void => {
    onClose();
  };

  if (!show) return null;

  return (
    <PaymentProcessor
      paymentType={paymentType}
      amount={amount}
      description={description}
      userId={userId}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
      onCancel={handlePaymentCancel}
      show={show}
      onClose={onClose}
      title={title}
      membershipData={membershipData}
    />
  );
}

export default ModalPago;
