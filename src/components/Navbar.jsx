import carroteGood from '../assets/carrote-good.svg'

const Navbar = ({ 
  isDarkMode, 
  onToggleTheme, 
  onSettings, 
  allergiesCount 
}) => {
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-brand-black/95 border-b border-white/10' 
          : 'bg-white/95 border-b border-gray-200'
      } backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-orange flex items-center justify-center shadow-lg shadow-brand-gold/30 p-2 transition-all duration-300 hover:scale-110 hover:shadow-brand-gold/50">
              <img 
                src={carroteGood} 
                alt="NutriFork" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span 
                className={`font-bold text-lg tracking-tight leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                NutriFork
              </span>
              <span 
                className={`text-[10px] uppercase tracking-wider font-medium ${
                  isDarkMode ? 'text-white/50' : 'text-gray-500'
                }`}
                style={{ letterSpacing: '0.08em' }}
              >
              </span>
            </div>
          </div>

          {/* Center Info - Hidden on small screens */}
          <div className="hidden md:flex items-center gap-4">
            {allergiesCount > 0 && (
              <>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white/70' : 'text-gray-700'
                  }`}>
                    {allergiesCount} {allergiesCount === 1 ? 'allergie' : 'allergies'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onSettings}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group relative ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Settings"
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {allergiesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  {allergiesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
