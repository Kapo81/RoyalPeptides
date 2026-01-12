import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboardMain from './AdminDashboardMain';
import AdminOrdersEnhanced from './AdminOrdersEnhanced';
import AdminInventory from './AdminInventory';
import AdminSettingsEnhanced from './AdminSettingsEnhanced';
import AdminSiteSettings from './AdminSiteSettings';
import AdminDiagnostics from './AdminDiagnostics';
import AdminProductsEnhanced from './AdminProductsEnhanced';
import { validateAdminSession } from '../lib/adminAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import SafeAdminLayout from '../components/SafeAdminLayout';
import { AlertTriangle } from 'lucide-react';

interface AdminMainProps {
  onNavigate: (page: string) => void;
}

export default function AdminMain({ onNavigate }: AdminMainProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    console.log('[AdminMain] Component mounted');
    checkSession();
  }, []);

  useEffect(() => {
    console.log(`[AdminMain] Active section changed to: ${activeSection}`);
  }, [activeSection]);

  const checkSession = async () => {
    console.log('[AdminMain] Validating admin session...');
    const isValid = await validateAdminSession();
    if (!isValid) {
      console.log('[AdminMain] Session invalid, redirecting to login');
      onNavigate('admin-login');
    } else {
      console.log('[AdminMain] Session valid');
    }
    setIsValidating(false);
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  const validSections = ['dashboard', 'orders', 'products', 'inventory', 'diagnostics', 'site-settings', 'settings'];
  const isValidSection = validSections.includes(activeSection);

  const renderNotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-full p-4 mb-6">
        <AlertTriangle className="h-12 w-12 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        The admin section you're trying to access doesn't exist or has been removed.
      </p>
      <button
        onClick={() => setActiveSection('dashboard')}
        className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,160,224,0.5)] transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <ErrorBoundary onNavigate={onNavigate} fallbackRoute="home">
      <SafeAdminLayout onNavigate={onNavigate}>
        <div className="flex">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onNavigate={onNavigate}
          />

          <main className="flex-1 lg:ml-64">
            <div className="p-6 md:p-8">
              <ErrorBoundary onNavigate={onNavigate} fallbackRoute="admin">
                {!isValidSection && renderNotFound()}
                {activeSection === 'dashboard' && <AdminDashboardMain />}
                {activeSection === 'orders' && <AdminOrdersEnhanced />}
                {activeSection === 'products' && <AdminProductsEnhanced />}
                {activeSection === 'inventory' && <AdminInventory />}
                {activeSection === 'diagnostics' && <AdminDiagnostics />}
                {activeSection === 'site-settings' && <AdminSiteSettings />}
                {activeSection === 'settings' && <AdminSettingsEnhanced />}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </SafeAdminLayout>
    </ErrorBoundary>
  );
}
