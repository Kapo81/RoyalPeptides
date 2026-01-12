import { useState, useEffect } from 'react';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import PageBackground from '../components/PageBackground';
import { adminLogin, validateAdminSession } from '../lib/adminAuth';

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/login');
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const isValid = await validateAdminSession();
    if (isValid) {
      onNavigate('admin');
    }
    setIsCheckingSession(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await adminLogin(username, password);

    if (response.success) {
      onNavigate('admin');
    } else {
      setError(response.error || 'Invalid username or password. Please try again.');
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] flex items-center justify-center px-4 relative overflow-hidden">
      <PageBackground variant="admin" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#00A0E0]/5 via-transparent to-cyan-500/5 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-[0_0_60px_rgba(0,160,224,0.15)]">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-[#00A0E0]/20 to-[#00A0E0]/5 rounded-xl border border-[#00A0E0]/30">
              <Lock className="h-10 w-10 text-[#00A0E0]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Royal Peptides</h1>
          <p className="text-gray-400 text-center mb-8">Admin Panel</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50 transition-colors"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50 transition-colors"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <p className="text-gray-500 text-xs mt-2 text-right">Forgot nothing</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="w-full mt-6 flex items-center justify-center gap-2 text-gray-400 hover:text-[#00A0E0] transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Secure admin access for Royal Peptides management
        </p>
      </div>
    </div>
  );
}
