import { ReactNode } from 'react';
import { Home, LogOut, Shield } from 'lucide-react';
import { adminLogout } from '../lib/adminAuth';

interface SafeAdminLayoutProps {
  children: ReactNode;
  onNavigate: (page: string) => void;
}

export default function SafeAdminLayout({ children, onNavigate }: SafeAdminLayoutProps) {
  const handleLogout = async () => {
    await adminLogout();
    onNavigate('home');
  };

  const handleBackToStore = () => {
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#05070b]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0B0D12] to-[#05070b] border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-lg border border-[#00A0E0]/30">
                <Shield className="h-5 w-5 text-[#00A0E0]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Royal Peptides
                </h1>
                <p className="text-xs text-gray-400 -mt-0.5">Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToStore}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-14">
        {children}
      </div>
    </div>
  );
}
