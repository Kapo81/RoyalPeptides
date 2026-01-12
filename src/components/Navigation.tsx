import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
}

export default function Navigation({ currentPage, onNavigate, cartCount }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { id: 'home', label: 'Royal Peptides' },
    { id: 'catalogue', label: t('nav.catalogue') },
    { id: 'stacks', label: t('nav.stacks') },
    { id: 'about', label: t('nav.about') },
    { id: 'shipping', label: t('nav.shipping_returns') },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050608]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
          : 'bg-[#050608]/60 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center hover:opacity-80 transition-opacity group relative"
          >
            <div className="absolute -inset-2 bg-[#00A0E0]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center space-x-3 relative z-10">
              <img
                src="/ab72c5e3-25b2-4790-8243-cdc880fc0bdc.png"
                alt="Royal Peptides"
                className="h-9 w-9 sm:h-11 sm:w-11 drop-shadow-[0_0_10px_rgba(0,147,208,0.6)]"
              />
              <span className="font-bold text-base sm:text-lg text-white tracking-wide">
                Royal Peptides
              </span>
            </div>
            <div className="h-4 w-px bg-white/20 mx-3 relative z-10 hidden sm:block" />
            <img
              src="/canada-logo.png"
              alt="Canada"
              className="h-3 w-6 sm:h-3.5 sm:w-7 relative z-10 object-contain opacity-90"
              style={{ aspectRatio: '2/1' }}
            />
          </button>

          <div className="hidden lg:flex items-center space-x-8">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className={`text-sm font-medium transition-all relative group tracking-wide ${
                  currentPage === link.id
                    ? 'text-[#00A0E0]'
                    : 'text-gray-300 hover:text-[#00A0E0]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] transition-all duration-300 ${
                    currentPage === link.id
                      ? 'opacity-100 shadow-[0_0_10px_rgba(0,147,208,0.8)]'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            ))}

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">CA</span>
              </div>
              <LanguageToggle />
            </div>

            <button
              onClick={() => handleNavigate('cart')}
              className="relative text-gray-300 hover:text-[#00A0E0] transition-colors p-2 hover:bg-white/5 rounded-lg backdrop-blur-sm group"
            >
              <div className="absolute inset-0 bg-[#00A0E0]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingCart className="h-5 w-5 relative z-10" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,147,208,0.8)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex lg:hidden items-center space-x-2">
            <div className="flex items-center px-2 py-1 bg-white/5 rounded-lg border border-white/10">
              <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">CA</span>
            </div>
            <LanguageToggle />

            <button
              onClick={() => handleNavigate('cart')}
              className="relative text-gray-300 hover:text-[#00A0E0] transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-[#00A0E0] transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={1.5} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 bg-[#050608]/95 backdrop-blur-xl">
            <div className="flex flex-col space-y-2">
              {links.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavigate(link.id)}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all tracking-wide ${
                    currentPage === link.id
                      ? 'bg-[#00A0E0]/20 text-[#00A0E0] border border-[#00A0E0]/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-[#00A0E0]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
