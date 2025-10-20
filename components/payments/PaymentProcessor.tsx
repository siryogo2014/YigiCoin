'use client';

import React, { useState, useEffect } from 'react';
import PayPalPayment from './PayPalPayment';
import MetaMaskPayment from './MetaMaskPayment';

interface PaymentDetails {
  amount: number;
  orderID?: string;
  transactionHash?: string;
  userData?: Record<string, unknown>;
  successMessage?: string;
}

interface MembershipData {
  currentLevel: string;
  nextLevel: string;
  benefits: string[];
}

interface PaymentProcessorProps {
  paymentType: 'registro' | 'membresia' | 'multa' | 'tiempo';
  amount: number;
  description: string;
  userId: string;
  onSuccess: (details: PaymentDetails) => void;
  onError: (error: Record<string, unknown>) => void;
  onCancel: () => void;
  show: boolean;
  onClose: () => void;
  title: string;
  membershipData?: MembershipData;
}

function PaymentProcessor({
  paymentType = 'membresia',
  amount = 0,
  description = '',
  userId = 'user_demo',
  onSuccess,
  onError,
  onCancel,
  show = false,
  onClose,
  title = 'Procesar Pago',
  membershipData,
}: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'metamask' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CORREGIDO: Función especializada para simulación de pagos de extensión de tiempo
  const handleSimulatedPayment = async (method: 'paypal' | 'metamask') => {
    setIsLoading(true);

    try {
      // Simular tiempo de procesamiento más corto para mejor experiencia
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // CORREGIDO: Generar detalles específicos según el tipo de pago
      const paymentDetails: PaymentDetails = {
        amount,
        orderID:
          method === 'paypal' ? `PAYPAL_${paymentType.toUpperCase()}_${Date.now()}` : undefined,
        transactionHash:
          method === 'metamask' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
        userData: {
          userId,
          paymentType,
          method,
          timestamp: new Date().toISOString(),
          // ESPECIALIZADO: Metadatos específicos para extensión de tiempo
          ...(paymentType === 'tiempo' && {
            timeExtension: {
              amount: amount,
              hours: amount === 2 ? 48 : 100,
              seconds: amount === 2 ? 172800 : 360000,
              description:
                amount === 2
                  ? '48 horas adicionales al contador actual'
                  : '100 horas adicionales al contador actual',
            },
          }),
        },
        successMessage:
          paymentType === 'tiempo'
            ? `¡Tiempo extendido exitosamente! Se han agregado ${amount === 2 ? '48 horas' : '100 horas'} a tu contador actual`
            : `¡Pago exitoso por $${amount} USD!`,
      };

      // CORREGIDO: Guardar registro específico para cada tipo de pago
      if (paymentType === 'tiempo') {
        await saveTimeExtensionRecord(paymentDetails, method);
      } else if (paymentType === 'multa') {
        await savePenaltyPaymentRecord(paymentDetails, method);
      } else {
        await saveGeneralPaymentRecord(paymentDetails, method);
      }

      onSuccess(paymentDetails);
    } catch (error) {
      onError({
        message: 'Error en el pago simulado',
        code: 'SIMULATION_ERROR',
        paymentType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // CORREGIDO: Función específica para registros de extensión de tiempo
  const saveTimeExtensionRecord = async (paymentDetails: PaymentDetails, method: string) => {
    try {
      const extensionRecord = {
        id: `time_extension_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
        userId,
        amount: paymentDetails.amount,
        method,
        hoursAdded: paymentDetails.amount === 2 ? 48 : 100,
        secondsAdded: paymentDetails.amount === 2 ? 172800 : 360000,
        transactionId: paymentDetails.orderID || paymentDetails.transactionHash,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: `Extensión manual de tiempo: ${paymentDetails.amount === 2 ? '48 horas' : '100 horas'}`,
        type: 'manual_time_extension',
      };

      if (typeof window !== 'undefined') {
        const existingExtensions = JSON.parse(localStorage.getItem('time_extensions') || '[]');
        existingExtensions.push(extensionRecord);
        localStorage.setItem('time_extensions', JSON.stringify(existingExtensions));
      }
    } catch (error) {
      console.error('Error saving time extension record:', error);
    }
  };

  // NUEVO: Función específica para registros de pagos de sanción
  const savePenaltyPaymentRecord = async (paymentDetails: PaymentDetails, method: string) => {
    try {
      const penaltyRecord = {
        id: `penalty_payment_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
        userId,
        amount: paymentDetails.amount,
        method,
        transactionId: paymentDetails.orderID || paymentDetails.transactionHash,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: `Pago de sanción por suspensión de cuenta: $${paymentDetails.amount} USD`,
        type: 'penalty_payment',
      };

      if (typeof window !== 'undefined') {
        const existingPenalties = JSON.parse(localStorage.getItem('penalty_payments') || '[]');
        existingPenalties.push(penaltyRecord);
        localStorage.setItem('penalty_payments', JSON.stringify(existingPenalties));
      }
    } catch (error) {
      console.error('Error saving penalty payment record:', error);
    }
  };

  // NUEVO: Función para pagos generales
  const saveGeneralPaymentRecord = async (paymentDetails: PaymentDetails, method: string) => {
    try {
      const generalRecord = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
        userId,
        amount: paymentDetails.amount,
        method,
        transactionId: paymentDetails.orderID || paymentDetails.transactionHash,
        timestamp: new Date().toISOString(),
        status: 'completed',
        description: description || `Pago por ${paymentType}`,
        type: paymentType,
      };

      if (typeof window !== 'undefined') {
        const existingPayments = JSON.parse(localStorage.getItem('general_payments') || '[]');
        existingPayments.push(generalRecord);
        localStorage.setItem('general_payments', JSON.stringify(existingPayments));
      }
    } catch (error) {
      console.error('Error saving general payment record:', error);
    }
  };

  const handlePayPalSuccess = (details: any) => {
    const paymentDetails: PaymentDetails = {
      amount,
      orderID: details.orderID || `PAYPAL_SIMULATION_${Date.now()}`,
      userData: {
        userId,
        paymentType,
        method: 'paypal',
        details,
        // CORREGIDO: Agregar metadatos específicos según el tipo
        ...(paymentType === 'tiempo' && {
          timeExtension: {
            amount: amount,
            hours: amount === 2 ? 48 : 100,
            seconds: amount === 2 ? 172800 : 360000,
          },
        }),
      },
      successMessage:
        paymentType === 'tiempo'
          ? `¡Tiempo extendido! Se agregaron ${amount === 2 ? '48 horas' : '100 horas'} a tu contador`
          : `¡Pago exitoso! Transacción completada por $${amount} USD`,
    };

    if (paymentType === 'tiempo') {
      saveTimeExtensionRecord(paymentDetails, 'paypal');
    } else if (paymentType === 'multa') {
      savePenaltyPaymentRecord(paymentDetails, 'paypal');
    } else {
      saveGeneralPaymentRecord(paymentDetails, 'paypal');
    }

    onSuccess(paymentDetails);
  };

  const handlePayPalError = (error: any) => {
    onError({
      message: 'Error en el pago con PayPal',
      originalError: error,
      paymentType,
    });
  };

  const handleMetaMaskSuccess = (details: Record<string, unknown>) => {
    const paymentDetails: PaymentDetails = {
      amount,
      transactionHash: (details.transactionHash as string) || '',
      userData: {
        userId,
        paymentType,
        method: 'metamask',
        ...details,
        // CORREGIDO: Agregar metadatos específicos según el tipo
        ...(paymentType === 'tiempo' && {
          timeExtension: {
            amount: amount,
            hours: amount === 2 ? 48 : 100,
            seconds: amount === 2 ? 172800 : 360000,
          },
        }),
      },
      successMessage:
        paymentType === 'tiempo'
          ? `¡Tiempo extendido! Se agregaron ${amount === 2 ? '48 horas' : '100 horas'} a tu contador`
          : `¡Pago exitoso! Transacción completada por $${amount} USD`,
    };

    if (paymentType === 'tiempo') {
      saveTimeExtensionRecord(paymentDetails, 'metamask');
    } else if (paymentType === 'multa') {
      savePenaltyPaymentRecord(paymentDetails, 'metamask');
    } else {
      saveGeneralPaymentRecord(paymentDetails, 'metamask');
    }

    onSuccess(paymentDetails);
  };

  const handleMetaMaskError = (error: any) => {
    onError({
      message: 'Error en el pago con MetaMask',
      originalError: error,
      paymentType,
    });
  };

  if (!mounted || !show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="text-center mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                paymentType === 'tiempo'
                  ? 'bg-gradient-to-r from-green-500 to-blue-600'
                  : paymentType === 'multa'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
            >
              <i
                className={`text-2xl text-white ${
                  paymentType === 'tiempo'
                    ? 'ri-time-line'
                    : paymentType === 'multa'
                      ? 'ri-alert-line'
                      : 'ri-money-dollar-circle-line'
                }`}
              ></i>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">
              ${amount.toLocaleString()} USD
            </h4>
            <p className="text-gray-600">{description}</p>

            {/* CORREGIDO: Información específica para cada tipo de pago */}
            {paymentType === 'tiempo' && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">
                  ⏰ Se agregarán {amount === 2 ? '48 horas' : '100 horas'} a tu contador actual
                </p>
                <p className="text-xs text-green-600 mt-1">
                  El tiempo se suma al contador existente, no lo reinicia
                </p>
              </div>
            )}

            {paymentType === 'multa' && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800">
                  🚨 Pago de sanción para reactivar cuenta suspendida
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Después del pago tu cuenta será reactivada automáticamente
                </p>
              </div>
            )}
          </div>

          {membershipData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Ascenso de Membresía</h4>
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Actual:</strong> {membershipData.currentLevel}
                </p>
                <p>
                  <strong>Nuevo:</strong> {membershipData.nextLevel}
                </p>
                <div className="mt-2">
                  <p>
                    <strong>Beneficios incluidos:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    {membershipData.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!selectedMethod ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
                Selecciona tu método de pago
              </h4>

              {/* CORREGIDO: Botón PayPal con mejor feedback específico */}
              <button
                onClick={() => handleSimulatedPayment('paypal')}
                disabled={isLoading}
                className={`w-full p-4 border rounded-lg transition-all cursor-pointer ${
                  isLoading
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                    : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <i className="ri-paypal-line text-2xl text-yellow-600"></i>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {isLoading ? 'Procesando pago...' : 'Pagar con PayPal'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {paymentType === 'tiempo'
                        ? 'Extensión de tiempo rápida y segura'
                        : paymentType === 'multa'
                          ? 'Reactivación de cuenta inmediata'
                          : 'Pago rápido y seguro'}
                    </p>
                  </div>
                  {!isLoading && <i className="ri-arrow-right-line text-gray-400"></i>}
                </div>
              </button>

              {/* CORREGIDO: Botón MetaMask con mejor feedback específico */}
              <button
                onClick={() => handleSimulatedPayment('metamask')}
                disabled={isLoading}
                className={`w-full p-4 border rounded-lg transition-all cursor-pointer ${
                  isLoading
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                    : 'bg-orange-50 border-orange-300 hover:bg-orange-100 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <i className="ri-currency-line text-2xl text-orange-600"></i>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {isLoading ? 'Procesando pago...' : 'Pagar con MetaMask'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {paymentType === 'tiempo'
                        ? 'Extensión con criptomonedas'
                        : paymentType === 'multa'
                          ? 'Reactivación con crypto'
                          : 'Pago con criptomonedas'}
                    </p>
                  </div>
                  {!isLoading && <i className="ri-arrow-right-line text-gray-400"></i>}
                </div>
              </button>

              {/* CORREGIDO: Información específica según el tipo de pago */}
              <div
                className={`${
                  paymentType === 'tiempo'
                    ? 'bg-green-50 border-green-200'
                    : paymentType === 'multa'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                } border rounded-lg p-3 text-center`}
              >
                <div className="flex items-center justify-center mb-2">
                  <i
                    className={`${
                      paymentType === 'tiempo'
                        ? 'ri-time-line text-green-600'
                        : paymentType === 'multa'
                          ? 'ri-shield-check-line text-red-600'
                          : 'ri-shield-check-line text-blue-600'
                    } mr-2`}
                  ></i>
                  <span
                    className={`text-sm font-medium ${
                      paymentType === 'tiempo'
                        ? 'text-green-800'
                        : paymentType === 'multa'
                          ? 'text-red-800'
                          : 'text-blue-800'
                    }`}
                  >
                    {paymentType === 'tiempo'
                      ? 'Proceso Instantáneo'
                      : paymentType === 'multa'
                        ? 'Reactivación Automática'
                        : 'Pago Seguro'}
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    paymentType === 'tiempo'
                      ? 'text-green-700'
                      : paymentType === 'multa'
                        ? 'text-red-700'
                        : 'text-blue-700'
                  }`}
                >
                  {paymentType === 'tiempo'
                    ? 'Ambos métodos procesarán tu extensión de tiempo inmediatamente'
                    : paymentType === 'multa'
                      ? 'Tu cuenta será reactivada automáticamente después del pago'
                      : 'Transacción procesada de forma segura'}
                </p>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : selectedMethod === 'paypal' ? (
            <PayPalPayment
              amount={amount}
              paymentType={paymentType}
              description={description}
              userId={userId}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={() => setSelectedMethod(null)}
            />
          ) : (
            <MetaMaskPayment
              amount={amount}
              paymentType={paymentType}
              description={description}
              userId={userId}
              onSuccess={handleMetaMaskSuccess}
              onError={handleMetaMaskError}
              onCancel={() => setSelectedMethod(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentProcessor;
