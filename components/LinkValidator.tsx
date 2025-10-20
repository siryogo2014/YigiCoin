'use client';

import React, { useEffect, useState } from 'react';
import { useReferralLinks } from '../hooks/useReferralLinks';

interface LinkValidatorProps {
  linkId: string;
  onValidation: (isValid: boolean, referrerId: string | null) => void;
  children?: React.ReactNode;
}

function LinkValidator({ linkId, onValidation, children }: LinkValidatorProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    referrerId: string | null;
    error: string | null;
  }>({
    isValid: false,
    referrerId: null,
    error: null,
  });

  const referralLinks = useReferralLinks();

  useEffect(() => {
    const validateLink = async (): Promise<void> => {
      setIsValidating(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const validation = referralLinks.validateLink(linkId);

        const result = {
          isValid: validation.isValid,
          referrerId: validation.referrerId,
          error: validation.isValid ? null : 'Enlace inválido o ya utilizado',
        };

        setValidationResult(result);
        onValidation(result.isValid, result.referrerId);
      } catch (error) {
        const errorResult = {
          isValid: false,
          referrerId: null,
          error: 'Error al validar el enlace',
        };

        setValidationResult(errorResult);
        onValidation(false, null);
      } finally {
        setIsValidating(false);
      }
    };

    if (linkId) {
      validateLink();
    } else {
      setValidationResult({
        isValid: false,
        referrerId: null,
        error: 'No se proporcionó un enlace válido',
      });
      onValidation(false, null);
      setIsValidating(false);
    }
  }, [linkId, referralLinks, onValidation]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Validando enlace de invitación...</p>
        </div>
      </div>
    );
  }

  if (!validationResult.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Enlace Inválido</h2>
          <p className="text-gray-600 mb-6">{validationResult.error}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Los enlaces de invitación solo pueden usarse una vez. Si crees que esto es un error,
              contacta al usuario que te invitó.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/login';
                }
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default LinkValidator;
