import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Database, Shield, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message: string;
  details?: any;
}

export default function AdminDiagnostics() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [environment, setEnvironment] = useState({
    url: '',
    hasAnonKey: false,
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
  });

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/diagnostics');
    setEnvironment({
      url: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
    });
  }, []);

  const updateResult = (index: number, update: Partial<TestResult>) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], ...update };
      return newResults;
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    const tests: TestResult[] = [
      { name: 'Database Connection', status: 'pending', message: 'Testing connection...' },
      { name: 'Read Products', status: 'pending', message: 'Fetching products...' },
      { name: 'Read Orders', status: 'pending', message: 'Fetching orders...' },
      { name: 'Write Test', status: 'pending', message: 'Creating test order...' },
      { name: 'Delete Test', status: 'pending', message: 'Deleting test order...' },
      { name: 'RLS Policies', status: 'pending', message: 'Checking permissions...' },
    ];
    setResults(tests);

    // Test 1: Database Connection
    updateResult(0, { status: 'running' });
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      updateResult(0, {
        status: 'success',
        message: `Connected successfully. Database has ${data?.length || 0} products table accessible.`,
      });
    } catch (error: any) {
      console.error('Connection test failed:', error);
      updateResult(0, {
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error,
      });
    }

    // Test 2: Read Products
    updateResult(1, { status: 'running' });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, is_in_stock, qty_in_stock')
        .limit(10);

      if (error) throw error;

      updateResult(1, {
        status: 'success',
        message: `Successfully read ${data?.length || 0} products`,
        details: data?.slice(0, 3),
      });
    } catch (error: any) {
      console.error('Read products failed:', error);
      updateResult(1, {
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error,
      });
    }

    // Test 3: Read Orders
    updateResult(2, { status: 'running' });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total')
        .limit(10);

      if (error) throw error;

      updateResult(2, {
        status: 'success',
        message: `Successfully read ${data?.length || 0} orders`,
        details: data?.slice(0, 3),
      });
    } catch (error: any) {
      console.error('Read orders failed:', error);
      updateResult(2, {
        status: 'error',
        message: `Failed: ${error.message}`,
        details: error,
      });
    }

    // Test 4: Write Test - Create test order
    updateResult(3, { status: 'running' });
    let testOrderId: string | null = null;
    try {
      const testOrder = {
        order_number: `TEST-${Date.now()}`,
        customer_first_name: 'Test',
        customer_last_name: 'User',
        customer_email: 'test@diagnostic.com',
        customer_phone: '555-0000',
        shipping_address: '123 Test St',
        shipping_city: 'Test City',
        shipping_province: 'ON',
        shipping_postal_code: 'A1A 1A1',
        shipping_country: 'Canada',
        payment_method: 'test',
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
        subtotal: 100,
        shipping_fee: 15,
        total: 115,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();

      if (error) throw error;

      testOrderId = data.id;
      updateResult(3, {
        status: 'success',
        message: `Successfully created test order: ${data.order_number}`,
        details: { id: data.id, order_number: data.order_number },
      });
    } catch (error: any) {
      console.error('Write test failed:', error);
      updateResult(3, {
        status: 'error',
        message: `Failed: ${error.message}. This often means RLS policies are blocking writes.`,
        details: error,
      });
    }

    // Test 5: Delete Test - Delete the test order
    updateResult(4, { status: 'running' });
    if (testOrderId) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', testOrderId);

        if (error) throw error;

        // Verify deletion
        const { data: checkData } = await supabase
          .from('orders')
          .select('id')
          .eq('id', testOrderId)
          .maybeSingle();

        if (checkData) {
          throw new Error('Order still exists after delete');
        }

        updateResult(4, {
          status: 'success',
          message: 'Successfully deleted test order and verified removal',
        });
      } catch (error: any) {
        console.error('Delete test failed:', error);
        updateResult(4, {
          status: 'error',
          message: `Failed: ${error.message}. Deletions may not persist.`,
          details: error,
        });
      }
    } else {
      updateResult(4, {
        status: 'error',
        message: 'Skipped: No test order was created',
      });
    }

    // Test 6: RLS Policies check
    updateResult(5, { status: 'running' });
    try {
      // Try to read RLS policies info (this might fail)
      const { data: policies, error } = await supabase.rpc('get_my_role');

      const permissionTests = {
        canReadProducts: false,
        canWriteProducts: false,
        canReadOrders: false,
        canWriteOrders: false,
      };

      // Test read products
      const { error: readProductsError } = await supabase.from('products').select('id').limit(1);
      permissionTests.canReadProducts = !readProductsError;

      // Test read orders
      const { error: readOrdersError } = await supabase.from('orders').select('id').limit(1);
      permissionTests.canReadOrders = !readOrdersError;

      updateResult(5, {
        status: permissionTests.canReadProducts && permissionTests.canReadOrders ? 'success' : 'error',
        message: 'Permissions checked',
        details: permissionTests,
      });
    } catch (error: any) {
      updateResult(5, {
        status: 'error',
        message: 'Unable to check RLS policies',
        details: error,
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'running':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">System Diagnostics</h1>
          <p className="text-gray-400">Test database connectivity, permissions, and persistence</p>
        </div>

        {/* Environment Info */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-[#00A0E0]" />
            <h2 className="text-xl font-bold text-white">Environment</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Mode:</span>
              <span className="ml-2 text-white font-mono">{environment.mode}</span>
            </div>
            <div>
              <span className="text-gray-400">Dev Mode:</span>
              <span className="ml-2 text-white">{environment.isDev ? 'Yes' : 'No'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Supabase URL:</span>
              <span className="ml-2 text-white font-mono text-xs">{environment.url}</span>
            </div>
            <div>
              <span className="text-gray-400">Anon Key:</span>
              <span className="ml-2 text-white">{environment.hasAnonKey ? '✓ Set' : '✗ Missing'}</span>
            </div>
          </div>
        </div>

        {/* Run Tests Button */}
        <div className="mb-6">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
          </button>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br backdrop-blur-xl rounded-xl p-6 border ${getStatusBg(result.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(result.status)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{result.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <details className="mt-3">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-[#00A0E0]">
                          View details
                        </summary>
                        <pre className="mt-2 p-3 bg-black/30 rounded text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Troubleshooting Guide */}
        <div className="mt-8 bg-gradient-to-br from-amber-500/10 to-amber-500/5 backdrop-blur-xl rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Common Issues</h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span><strong className="text-white">RLS Policy Errors:</strong> Database Row Level Security is blocking anonymous operations. Admin operations need proper authentication or RLS policies must allow anonymous access.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span><strong className="text-white">Connection Errors:</strong> Check that environment variables are set correctly in .env file.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span><strong className="text-white">Delete Not Persisting:</strong> If delete test fails, deletions in admin panel won't work. This is usually an RLS policy issue.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span><strong className="text-white">Blank Inventory:</strong> If Read Products fails, inventory page will be blank. Check database connection and RLS policies.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
