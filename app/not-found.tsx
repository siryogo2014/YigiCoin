import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-white"></i>
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
          <p className="text-lg text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-home-line mr-2"></i>
            Volver al inicio
          </Link>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-login-box-line mr-2"></i>
              Iniciar Sesión
            </Link>

            <Link
              href="/registro"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-add-line mr-2"></i>
              Registrarse
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Si crees que esto es un error, puedes contactarnos
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
              <i className="ri-mail-line mr-1"></i>
              Soporte
            </button>
            <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
              <i className="ri-question-line mr-1"></i>
              Ayuda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
