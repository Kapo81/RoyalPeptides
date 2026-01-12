import { LayoutDashboard, Package, LayoutGrid, Settings, LogOut, ExternalLink, Menu, X, Activity, Globe } from 'lucide-react';
import { useState } from 'react';
import { adminLogout } from '../lib/adminAuth';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNavigate: (page: string) => void;
}

export default function AdminSidebar({ activeSection, onSectionChange, onNavigate }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    onNavigate('home');
  };

  const handleViewStore = () => {
    window.open('/', '_blank');
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'inventory', icon: LayoutGrid, label: 'Inventory' },
    { id: 'diagnostics', icon: Activity, label: 'Diagnostics' },
    { id: 'site-settings', icon: Globe, label: 'Site Settings' },
    { id: 'settings', icon: Settings, label: 'Admin Settings' },
  ];

  const handleMenuClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0D12] border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Royal Peptides</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#0B0D12] to-[#05070b] border-r border-white/10 transition-transform duration-300 z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:w-64 w-64`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-lg border border-[#00A0E0]/30">
                <LayoutDashboard className="h-6 w-6 text-[#00A0E0]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Royal Peptides</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white shadow-[0_0_20px_rgba(0,160,224,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm font-semibold text-white">Royal4781</p>
            </div>
            <button
              onClick={handleViewStore}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Store</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
