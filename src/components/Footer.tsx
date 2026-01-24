import { AlertTriangle, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CanadaLogo from './CanadaLogo';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#050608] text-white border-t border-white/10 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,147,208,0.08)_0%,_transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4 relative group">
              <div className="absolute -inset-3 bg-[#00A0E0]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/ab72c5e3-25b2-4790-8243-cdc880fc0bdc.png"
                alt="Royal Peptides"
                className="h-10 w-10 relative z-10 drop-shadow-[0_0_15px_rgba(0,147,208,0.6)]"
              />
              <span className="font-bold text-xl text-white tracking-wide relative z-10">Royal Peptides</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <div className="space-y-2 mb-3">
              <p className="text-xs text-gray-500">• {t('common.inventory_tracked')}</p>
              <p className="text-xs text-gray-500">• {t('common.discreet_packaging')}</p>
              <p className="text-xs text-gray-500">• {t('common.secure_checkout')}</p>
            </div>
            <div className="flex items-center space-x-2 text-[#00A0E0] text-sm font-medium">
              <CanadaLogo variant="nav" />
              <span className="text-xs">Canadian</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-400 hover:text-[#00A0E0] text-sm transition-all hover:translate-x-1 inline-block"
                >
                  Royal Peptides
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="text-gray-400 hover:text-[#00A0E0] text-sm transition-all hover:translate-x-1 inline-block"
                >
                  {t('nav.catalogue')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stacks')}
                  className="text-gray-400 hover:text-[#00A0E0] text-sm transition-all hover:translate-x-1 inline-block"
                >
                  {t('nav.stacks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-gray-400 hover:text-[#00A0E0] text-sm transition-all hover:translate-x-1 inline-block"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shipping')}
                  className="text-gray-400 hover:text-[#00A0E0] text-sm transition-all hover:translate-x-1 inline-block"
                >
                  {t('nav.shipping_returns')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-[#00A0E0]" />
                <a href="mailto:peptidesroyal@gmail.com" className="hover:text-[#00A0E0] transition-colors">
                  peptidesroyal@gmail.com
                </a>
              </div>
              <div className="text-gray-500 text-xs space-y-1">
                <p>Response time: 24-48 hours</p>
                <p>Business inquiries welcome</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">{t('footer.research_use_only')}</span>
          </div>
          <p className="text-gray-400 text-xs text-center max-w-3xl mx-auto leading-relaxed px-2 mb-2">
            {t('footer.research_use_only')}
          </p>
        </div>

        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-gray-500 text-xs">
            <span>{t('common.discreet_packaging')}</span>
            <span className="text-gray-700">•</span>
            <span>{t('common.international_shipping')}</span>
            <span className="text-gray-700">•</span>
            <span>{t('common.inventory_tracked')}</span>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-gray-600 text-xs">
            <button onClick={() => onNavigate('legal')} className="hover:text-gray-400 transition-colors">
              {t('footer.privacy_policy')}
            </button>
            <span className="text-gray-800">•</span>
            <button onClick={() => onNavigate('legal')} className="hover:text-gray-400 transition-colors">
              {t('footer.terms_of_service')}
            </button>
            <span className="text-gray-800">•</span>
            <button onClick={() => onNavigate('shipping')} className="hover:text-gray-400 transition-colors">
              {t('footer.refund_policy')}
            </button>
          </div>
          <p className="text-gray-500 text-xs tracking-wide">
            © {new Date().getFullYear()} Royal Peptides. {t('footer.all_rights_reserved')}
          </p>
          <button
            onClick={() => onNavigate('admin-login')}
            className="text-gray-700 hover:text-gray-500 text-xs transition-colors"
          >
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
}
