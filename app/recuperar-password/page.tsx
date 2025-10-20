'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RecuperarPasswordPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.email) {
      setError('Por favor, ingresa tu correo electrónico');
      setIsLoading(false);
      return;
    }

    // Simular envío del código de verificación
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess('Código de verificación enviado a tu correo electrónico');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('Error al enviar el código. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.verificationCode) {
      setError('Por favor, ingresa el código de verificación');
      setIsLoading(false);
      return;
    }

    if (formData.verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      setIsLoading(false);
      return;
    }

    // Simular verificación del código
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep(3);
    } catch (err) {
      setError('Código de verificación inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Simular actualización de contraseña
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess('¡Contraseña actualizada exitosamente!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      setError('Error al actualizar la contraseña. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess('Código reenviado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al reenviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20digital%20security%20background%20with%20soft%20blue%20gradients%2C%20abstract%20geometric%20patterns%2C%20minimalist%20design%2C%20professional%20atmosphere%2C%20cybersecurity%20theme%2C%20password%20recovery%20concept%2C%20clean%20and%20trustworthy%20visual%20elements%2C%20subtle%20tech%20textures%2C%20calming%20blue%20tones&width=1920&height=1080&seq=password-recovery-bg&orientation=landscape')`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="max-w-md w-full relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/a843437a18888ba7a9ccb0aa69eab34d.png"
              alt="YigiCoin Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Recuperar Contraseña</h1>
          <p className="text-gray-200">
            {step === 1 && 'Ingresa tu correo para recuperar tu cuenta'}
            {step === 2 && 'Verifica el código enviado a tu correo'}
            {step === 3 && 'Crea una nueva contraseña segura'}
          </p>
        </div>

        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-2 mx-2 rounded-full ${
                step >= 2 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}
            >
              2
            </div>
            <div
              className={`flex-1 h-2 mx-2 rounded-full ${
                step >= 3 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-200 mt-2">
            <span>Email</span>
            <span>Código</span>
            <span>Nueva contraseña</span>
          </div>
        </div>

        {/* Formulario principal */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Paso 1: Solicitar email */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-mail-line text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Te enviaremos un código de verificación a este correo
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  isLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enviando código...
                  </div>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i>
                    Enviar Código de Verificación
                  </>
                )}
              </button>
            </form>
          )}

          {/* Paso 2: Verificar código */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Código de Verificación
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-shield-check-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Código enviado a: {formData.email}</p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  <i className="ri-refresh-line mr-1"></i>
                  Reenviar código
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                >
                  <i className="ri-arrow-left-line mr-1"></i>
                  Cambiar email
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  isLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Verificar Código
                  </>
                )}
              </button>
            </form>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-lock-line text-gray-400"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <i
                      className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400`}
                    ></i>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-lock-line text-gray-400"></i>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    <i
                      className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400`}
                    ></i>
                  </button>
                </div>
              </div>

              {/* Indicadores de seguridad */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Requisitos de contraseña:
                </h4>
                <div className="space-y-1 text-xs">
                  <div
                    className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <i
                      className={`${formData.newPassword.length >= 8 ? 'ri-check-line' : 'ri-close-line'} mr-2`}
                    ></i>
                    Al menos 8 caracteres
                  </div>
                  <div
                    className={`flex items-center ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <i
                      className={`${/[A-Z]/.test(formData.newPassword) ? 'ri-check-line' : 'ri-close-line'} mr-2`}
                    ></i>
                    Al menos una mayúscula
                  </div>
                  <div
                    className={`flex items-center ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <i
                      className={`${/[0-9]/.test(formData.newPassword) ? 'ri-check-line' : 'ri-close-line'} mr-2`}
                    ></i>
                    Al menos un número
                  </div>
                  <div
                    className={`flex items-center ${formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <i
                      className={`${formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 ? 'ri-check-line' : 'ri-close-line'} mr-2`}
                    ></i>
                    Las contraseñas coinciden
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  isLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Actualizando contraseña...
                  </div>
                ) : (
                  <>
                    <i className="ri-save-line mr-2"></i>
                    Actualizar Contraseña
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-2"></i>
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Enlaces de navegación */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-200">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>

        {/* Información de ayuda */}
        <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="ri-question-line text-blue-500"></i>
            <span className="text-sm font-medium text-gray-700">¿Necesitas ayuda?</span>
          </div>
          <p className="text-xs text-gray-600">
            Si no recibes el código o tienes problemas, contacta a nuestro equipo de soporte
          </p>
        </div>
      </div>
    </div>
  );
}
