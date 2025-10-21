'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // SIMULACIÓN: Deshabilitar validación para facilitar el flujo
    // Validación básica
    // if (!formData.email || !formData.password) {
    //   setError('Por favor, completa todos los campos');
    //   setIsLoading(false);
    //   return;
    // }

    // Simular llamada a la API
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Tiempo reducido
      // Redirigir al dashboard después del login exitoso
      router.push('/');
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/ebaf276b4f400c457fd43c320cfe98d3.jfif')`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="max-w-md w-full relative z-10">
        {/* Logo y bienvenida */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="https://static.readdy.ai/image/fa982b2d84ae81859cd336f4cd41635f/a843437a18888ba7a9ccb0aa69eab34d.png"
              alt="YigiCoin Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido a YigiCoin</h1>
          <p className="text-gray-200">Inicia sesión para acceder a tu cuenta</p>
        </div>

        {/* Formulario de login */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Tu contraseña"
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

            {/* Recordar sesión y recuperar contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Recordar sesión</span>
              </label>
              <Link
                href="/recuperar-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botón de iniciar sesión */}
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
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión (SIMULACIÓN)'
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Opciones de login social */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <i className="ri-google-fill text-red-500 mr-2"></i>
              Google
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <i className="ri-facebook-fill text-blue-600 mr-2"></i>
              Facebook
            </button>
          </div>
        </div>

        {/* ELIMINADO: Enlace a registro completamente removido */}

        {/* Información adicional */}
        <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="ri-shield-check-line text-green-500"></i>
            <span className="text-sm font-medium text-gray-700">Seguridad garantizada</span>
          </div>
          <p className="text-xs text-gray-600">
            Tus datos están protegidos con encriptación de nivel bancario
          </p>
        </div>
      </div>
    </div>
  );
}
