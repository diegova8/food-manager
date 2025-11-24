import { Link } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/logo.png';

function HomePage() {
  const isAuthenticated = api.isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          <img
            src={logo}
            alt="Ceviche de mi Tata"
            className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-4 border-white shadow-xl"
          />
        </div>
                  <div className="text-center mb-10">
            <h1 className="text-lg md:text-xl text-slate-600">
              El mejor ceviche.
            </h1>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-2xl">

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Menu Option */}
            <Link
              to="/menu"
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-5 shadow-xl hover:shadow-orange-300/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Ver Menú
                  </h2>
                  <p className="text-white/80 text-sm">
                    Descubre nuestros ceviches
                  </p>
                </div>
                <svg className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Register/Profile Option */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="group relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-2xl p-5 shadow-xl hover:shadow-teal-300/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Mi Perfil
                    </h2>
                    <p className="text-white/80 text-sm">
                      Pedidos y cuenta
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ) : (
              <Link
                to="/register"
                className="group relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-2xl p-5 shadow-xl hover:shadow-teal-300/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Registrarse
                    </h2>
                    <p className="text-white/80 text-sm">
                      Crea tu cuenta
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>

          {/* Login link for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-8 text-center">
              <p className="text-slate-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700 underline underline-offset-2">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Ceviche de mi Tata
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
