import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr-CA' ? 'en' : 'fr-CA';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`group relative flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-[#00A0E0]/50 transition-all duration-300 ${className}`}
      aria-label={currentLang === 'fr-CA' ? 'Switch to English' : 'Passer au français'}
    >
      <Globe className="h-4 w-4 text-[#00A0E0] group-hover:scale-110 transition-transform duration-300" />
      <span className="text-sm font-medium text-white group-hover:text-[#00A0E0] transition-colors">
        {currentLang === 'fr-CA' ? 'FR' : 'EN'}
      </span>
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00A0E0]/10 to-transparent pointer-events-none" />
    </button>
  );
}
