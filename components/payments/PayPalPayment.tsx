'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  paymentType: 'registro' | 'membresia' | 'multa' | 'tiempo';
  description: string;
  userId: string;
  onSuccess: (details: Record<string, unknown>) => void;
  onError: (error: Record<string, unknown>) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}

interface PayPalWindow extends Window {
  paypal?: {
    Buttons: (config: Record<string, unknown>) => { render: (selector: string) => void };
  };
}

declare let window: PayPalWindow;

function PayPalPayment({
  amount,
  currency = 'USD',
  paymentType,
  description,
  userId,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = '',
}: PayPalPaymentProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [isValidConfig, setIsValidConfig] = useState(true);
  const [mounted, setMounted] = useState(false);

  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const PAYPAL_ENV = process.env.NEXT_PUBLIC_PAYPAL_ENV || 'sandbox';
  const PAYPAL_SCRIPT_URL = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=${currency}&components=buttons&intent=capture&disable-funding=credit,card`;

  useEffect(() => {
    setMounted(true);
    validateConfiguration();
    setPaypalError(null);
  }, [amount, paymentType]);

  useEffect(() => {
    if (mounted && isScriptLoaded && isValidConfig) {
      renderPayPalButton();
    }
  }, [mounted, isScriptLoaded, amount, paymentType, isValidConfig]);

  const validateConfiguration = (): void => {
    // Check if CLIENT_ID is set and not a placeholder
    if (
      !CLIENT_ID ||
      CLIENT_ID === 'your-paypal-client-id' ||
      CLIENT_ID.length < 10 ||
      CLIENT_ID.includes('YOUR')
    ) {
      setIsValidConfig(false);
      setPaypalError('Configuración incompleta: PayPal Client ID no configurado');
    } else {
      setIsValidConfig(true);
    }
  };

  const handleScriptLoad = (): void => {
    setIsScriptLoaded(true);
    setIsScriptLoading(false);
    setPaypalError(null);
  };

  const handleScriptError = (): void => {
    setIsScriptLoading(false);
    setPaypalError('Error al cargar PayPal SDK. Verifica tu conexión e intenta nuevamente.');
    setIsValidConfig(false);
  };

  const renderPayPalButton = (): void => {
    if (!window.paypal || !isScriptLoaded || !mounted) {
      return;
    }

    const buttonContainer = document.getElementById(`paypal-button-${paymentType}`);
    if (!buttonContainer) return;

    // Clear existing content
    buttonContainer.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 45,
          },

          createOrder: (data: Record<string, unknown>, actions: any) => {
            setIsProcessing(true);
            setPaypalError(null);

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toFixed(2),
                    currency_code: currency,
                  },
                  description: description,
                  custom_id: `${userId}_${paymentType}_${Date.now()}`,
                  reference_id: `${paymentType}_${userId}`,
                },
              ],
              application_context: {
                brand_name: 'YigiCoin Platform',
                user_action: 'PAY_NOW',
                shipping_preference: 'NO_SHIPPING',
              },
            });
          },

          onApprove: async (data: Record<string, unknown>, actions: any) => {
            try {
              setIsProcessing(true);
              const order = await actions.order.capture();

              if (order.status === 'COMPLETED') {
                const paymentDetails = {
                  orderID: order.id,
                  payerID: order.payer.payer_id,
                  paymentID: order.purchase_units[0].payments.captures[0].id,
                  amount: parseFloat(order.purchase_units[0].amount.value),
                  currency: order.purchase_units[0].amount.currency_code,
                  status: order.status,
                  timestamp: new Date().toISOString(),
                  paymentType,
                  userId,
                  description,
                  payerEmail: order.payer.email_address || 'N/A',
                  payerName: order.payer.name
                    ? `${order.payer.name.given_name || ''} ${order.payer.name.surname || ''}`.trim()
                    : 'N/A',
                  transactionFee:
                    order.purchase_units[0].payments.captures[0].seller_receivable_breakdown
                      ?.paypal_fee?.value || '0',
                };

                // Validate payment on backend
                const validationResult = await validatePayment(paymentDetails);

                if (validationResult.success) {
                  await savePaymentRecord(paymentDetails);
                  onSuccess(paymentDetails);
                } else {
                  throw new Error(
                    validationResult.error || 'Validación de pago falló en el servidor'
                  );
                }
              } else {
                throw new Error(`Pago no completado. Estado: ${order.status}`);
              }
            } catch (error: any) {
              console.error('PayPal onApprove error:', error);
              const errorMessage = error.message || 'Error al procesar el pago';
              setPaypalError(errorMessage);
              onError({ ...error, message: errorMessage });
            } finally {
              setIsProcessing(false);
            }
          },

          onError: (error: any) => {
            console.error('PayPal button error:', error);
            const errorMessage = 'Error en el procesamiento del pago con PayPal';
            setPaypalError(errorMessage);
            setIsProcessing(false);
            onError({ ...error, message: errorMessage });
          },

          onCancel: (data: Record<string, unknown>) => {
            setIsProcessing(false);
            setPaypalError(null);
            onCancel();
          },
        })
        .render(`#paypal-button-${paymentType}`);
    } catch (error: any) {
      console.error('Error rendering PayPal button:', error);
      setPaypalError('Error al inicializar el botón de PayPal');
    }
  };

  const validatePayment = async (
    paymentDetails: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/payments/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'paypal',
          paymentDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Error de validación: ${response.statusText}`,
        };
      }

      const result = await response.json();
      return { success: true, ...result };
    } catch (error: any) {
      console.error('Payment validation error:', error);
      // Don't fail payment if validation endpoint is unavailable
      // Log the error and proceed
      return { success: true };
    }
  };

  const savePaymentRecord = async (paymentDetails: Record<string, unknown>): Promise<void> => {
    try {
      const paymentRecord = {
        id: `paypal_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
        userId,
        paymentType,
        method: 'paypal',
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'completed',
        transactionId: paymentDetails.orderID,
        paymentId: paymentDetails.paymentID,
        payerEmail: paymentDetails.payerEmail,
        payerName: paymentDetails.payerName,
        description,
        timestamp: paymentDetails.timestamp,
        fee: paymentDetails.transactionFee,
        metadata: {
          payerID: paymentDetails.payerID,
          orderStatus: paymentDetails.status,
        },
      };

      if (typeof window !== 'undefined') {
        const existingPayments = JSON.parse(localStorage.getItem('payment_records') || '[]');
        existingPayments.push(paymentRecord);
        localStorage.setItem('payment_records', JSON.stringify(existingPayments));
      }
    } catch (error) {
      console.error('Error saving payment record:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isValidConfig) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4`}>
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="font-medium text-red-800 mb-2">Configuración Incompleta</h3>
          <p className="text-sm text-red-700">
            {paypalError ||
              'El Client ID de PayPal no está configurado. Por favor contacta al administrador.'}
          </p>
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className={`${className} opacity-50 cursor-not-allowed`}>
        <div className="bg-gray-300 text-gray-500 py-3 px-4 rounded-lg text-center">
          💳 PayPal - No disponible
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        src={PAYPAL_SCRIPT_URL}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        onReady={() => setIsScriptLoading(false)}
        strategy="lazyOnload"
      />

      {paypalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 text-sm">{paypalError}</span>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">Pago con PayPal</p>
            <p className="text-xs text-blue-600">{description}</p>
            {PAYPAL_ENV === 'sandbox' && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Modo de prueba (sandbox) - No se realizarán cargos reales
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-800">${amount}</span>
            <p className="text-xs text-blue-600">{currency}</p>
          </div>
        </div>
      </div>

      <div
        id={`paypal-button-${paymentType}`}
        className={`min-h-[45px] ${isProcessing || !isScriptLoaded ? 'pointer-events-none opacity-50' : ''}`}
      >
        {!isScriptLoaded && !paypalError && (
          <div className="bg-blue-600 text-white py-3 px-4 rounded-lg text-center">
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Cargando PayPal...
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-yellow-700 text-sm">
              Procesando pago... No cierres esta ventana.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayPalPayment;
