import { useState, useEffect } from 'react';
import { Package, Edit, Plus, Minus, Eye, EyeOff, TrendingUp, DollarSign, AlertTriangle, Filter, CheckCircle, Zap, RefreshCw, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';
import ProductFormModal from '../components/ProductFormModal';
import { toNumber, money, int, safeFixed } from '../utils/number';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  cost_price: number;
  selling_price: number;
  qty_in_stock: number;
  qty_sold: number;
  form: string;
  is_in_stock: boolean;
  image_url: string;
  categories: string[];
  updated_at?: string;
}

interface InventoryStats {
  total_products_in_stock: number;
  total_units_in_stock: number;
  total_units_sold: number;
  total_revenue: number;
  low_stock_count: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  qty_sold: number;
  total_sales: number;
  image_url: string;
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterForm, setFilterForm] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [customRestockAmount, setCustomRestockAmount] = useState('10');
  const [showCustomRestock, setShowCustomRestock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/inventory');
    fetchInventory();
    fetchStats();
    fetchTopProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filterCategory, filterStatus, filterForm, searchTerm]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    setCategories(data || []);
  };

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    console.log('[AdminInventory] Fetching products from database...');

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        console.log(`[AdminInventory] Successfully fetched ${data.length} products`);
        const productsWithCategories = await Promise.all(
          data.map(async (product) => {
            const { data: productCats } = await supabase
              .from('product_categories')
              .select('category_id')
              .eq('product_id', product.id);

            const categoryIds = productCats?.map(pc => pc.category_id) || [];

            const { data: categoryData } = await supabase
              .from('categories')
              .select('name')
              .in('id', categoryIds);

            return {
              ...product,
              categories: categoryData?.map(c => c.name) || [],
            };
          })
        );

        console.log('[AdminInventory] Processed products with categories:', productsWithCategories.length);
        setProducts(productsWithCategories);
      } else {
        console.warn('[AdminInventory] No data returned from fetch');
        setProducts([]);
      }
    } catch (err: any) {
      console.error('[AdminInventory] FETCH FAILED:', err);
      setError(`Failed to load inventory: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_inventory_stats');

      if (!error && data && data.length > 0) {
        console.log('[AdminInventory] Stats fetched:', data[0]);
        setStats(data[0]);
      } else if (error) {
        console.error('[AdminInventory] Failed to fetch stats:', error);
      }
    } catch (err) {
      console.error('[AdminInventory] Stats fetch error:', err);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_top_selling_products', { limit_count: 5 });

      if (!error && data) {
        console.log('[AdminInventory] Top products fetched:', data.length);
        setTopProducts(data);
      } else if (error) {
        console.error('[AdminInventory] Failed to fetch top products:', error);
        setTopProducts([]);
      }
    } catch (err) {
      console.error('[AdminInventory] Top products fetch error:', err);
      setTopProducts([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'in-stock') {
        filtered = filtered.filter(p => p.is_in_stock);
      } else if (filterStatus === 'out-of-stock') {
        filtered = filtered.filter(p => !p.is_in_stock);
      } else if (filterStatus === 'low-stock') {
        filtered = filtered.filter(p => p.qty_in_stock > 0 && p.qty_in_stock <= 5);
      }
    }

    if (filterForm !== 'all') {
      filtered = filtered.filter(p => p.form === filterForm);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.categories.includes(filterCategory));
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    console.log('[AdminInventory] Opening modal for new product');
    setEditingProductId(undefined);
    setIsModalOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    console.log('[AdminInventory] Opening modal to edit product:', productId);
    setEditingProductId(productId);
    setIsModalOpen(true);
  };

  const handleModalSuccess = async () => {
    console.log('[AdminInventory] Product saved successfully, refreshing...');
    setToastMessage('Product saved successfully');
    await fetchInventory();
    await fetchStats();
    await fetchTopProducts();
  };

  const adjustStock = async (productId: string, adjustment: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentStock = toNumber(product.qty_in_stock, 0);
    const newQty = Math.max(0, currentStock + adjustment);

    console.log('[AdminInventory] Adjusting stock:', productId, product.name, `${currentStock} -> ${newQty}`);

    const { error } = await supabase
      .from('products')
      .update({ qty_in_stock: newQty })
      .eq('id', productId);

    if (!error) {
      console.log('[AdminInventory] Stock adjustment successful, refetching...');
      setToastMessage(`Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`);
      await fetchInventory();
      await fetchStats();
    } else {
      console.error('[AdminInventory] STOCK ADJUSTMENT FAILED:', error);
      setToastMessage(`Failed to adjust stock: ${error.message}`);
    }
  };

  const toggleActive = async (productId: string, currentStatus: boolean) => {
    console.log('[AdminInventory] Toggling product active status:', productId, `${currentStatus} -> ${!currentStatus}`);

    const { error } = await supabase
      .from('products')
      .update({ is_in_stock: !currentStatus })
      .eq('id', productId);

    if (!error) {
      console.log('[AdminInventory] Toggle successful, refetching...');
      setToastMessage(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      await fetchInventory();
    } else {
      console.error('[AdminInventory] TOGGLE FAILED:', error);
      setToastMessage(`Failed to toggle product: ${error.message}`);
    }
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleMarkOutOfStock = async () => {
    if (selectedProducts.size === 0) {
      setToastMessage('Please select products first');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ is_in_stock: false })
      .in('id', Array.from(selectedProducts));

    if (!error) {
      setToastMessage(`Saved ✓ - ${selectedProducts.size} products marked out of stock`);
      setSelectedProducts(new Set());
      await fetchInventory();
      await fetchStats();
    } else {
      setToastMessage(`Failed: ${error.message}`);
    }
  };

  const handleRestock10 = async () => {
    if (selectedProducts.size === 0) {
      setToastMessage('Please select products first');
      return;
    }

    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));

    const updates = selectedProductsList.map(product =>
      supabase
        .from('products')
        .update({
          qty_in_stock: toNumber(product.qty_in_stock, 0) + 10,
          is_in_stock: true
        })
        .eq('id', product.id)
    );

    await Promise.all(updates);

    setToastMessage(`Saved ✓ - Added 10 units to ${selectedProducts.size} products`);
    setSelectedProducts(new Set());
    await fetchInventory();
    await fetchStats();
  };

  const handleCustomRestock = async () => {
    if (selectedProducts.size === 0) {
      setToastMessage('Please select products first');
      return;
    }

    const amount = parseInt(customRestockAmount);
    if (isNaN(amount) || amount <= 0) {
      setToastMessage('Please enter a valid amount');
      return;
    }

    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));

    const updates = selectedProductsList.map(product =>
      supabase
        .from('products')
        .update({
          qty_in_stock: toNumber(product.qty_in_stock, 0) + amount,
          is_in_stock: true
        })
        .eq('id', product.id)
    );

    await Promise.all(updates);

    setToastMessage(`Saved ✓ - Added ${amount} units to ${selectedProducts.size} products`);
    setSelectedProducts(new Set());
    setShowCustomRestock(false);
    await fetchInventory();
    await fetchStats();
  };

  const handleBulkPriceRounder = async () => {
    const updates = products.map(product => {
      const currentPrice = toNumber(product.selling_price, 0);
      const roundedPrice = Math.floor(currentPrice) + 0.99;
      return supabase
        .from('products')
        .update({ selling_price: roundedPrice })
        .eq('id', product.id);
    });

    await Promise.all(updates);

    setToastMessage(`Saved ✓ - Rounded ${products.length} product prices to .99`);
    await fetchInventory();
    await fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Manage product stock, pricing, and availability</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-xl rounded-xl border border-red-500/30 p-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Inventory</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchInventory}
              className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg hover:shadow-[0_0_20px_rgba(0,160,224,0.4)] transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        productId={editingProductId}
      />

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Manage product stock, pricing, and availability</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg hover:shadow-[0_0_20px_rgba(0,160,224,0.4)] transition-all font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-[#00A0E0]" />
                <p className="text-xs text-gray-400">Products</p>
              </div>
              <p className="text-2xl font-bold text-white">{int(stats.total_products_in_stock)}</p>
              <p className="text-xs text-gray-500">In Stock</p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-green-400" />
                <p className="text-xs text-gray-400">Units</p>
              </div>
              <p className="text-2xl font-bold text-white">{int(stats.total_units_in_stock)}</p>
              <p className="text-xs text-gray-500">Available</p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <p className="text-xs text-gray-400">Sold</p>
              </div>
              <p className="text-2xl font-bold text-white">{int(stats.total_units_sold)}</p>
              <p className="text-xs text-gray-500">Total Units</p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <p className="text-xs text-gray-400">Revenue</p>
              </div>
              <p className="text-2xl font-bold text-white">${int(stats.total_revenue)}</p>
              <p className="text-xs text-gray-500">Total Sales</p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <p className="text-xs text-gray-400">Low Stock</p>
              </div>
              <p className="text-2xl font-bold text-white">{int(stats.low_stock_count)}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
          </div>
        )}

        {topProducts.length > 0 && (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Top Selling Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topProducts.map((product) => (
                <div key={product.product_id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm font-semibold text-white mb-2 line-clamp-2">{product.product_name}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Sold: {int(product.qty_sold)}</span>
                    <span className="text-green-400 font-semibold">${int(product.total_sales)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00A0E0]" />
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              {selectedProducts.size > 0 && (
                <span className="px-2 py-1 bg-[#00A0E0]/20 border border-[#00A0E0]/50 text-[#00A0E0] text-xs rounded">
                  {selectedProducts.size} selected
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={handleMarkOutOfStock}
              disabled={selectedProducts.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">Mark Out of Stock</span>
            </button>

            <button
              onClick={handleRestock10}
              disabled={selectedProducts.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Restock +10</span>
            </button>

            {!showCustomRestock ? (
              <button
                onClick={() => setShowCustomRestock(true)}
                disabled={selectedProducts.size === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Restock Custom</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customRestockAmount}
                  onChange={(e) => setCustomRestockAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                />
                <button
                  onClick={handleCustomRestock}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowCustomRestock(false)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleBulkPriceRounder}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/20 transition-all"
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Round Prices to .99</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#00A0E0]" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="low-stock">Low Stock (≤5)</option>
            </select>

            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
            >
              <option value="all">All Forms</option>
              <option value="vial">Vial</option>
              <option value="bottle">Bottle</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 p-12">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Inventory Data Found</h3>
              <p className="text-gray-400 mb-6">
                Your inventory is empty. Products will appear here once they're added to your catalogue.
              </p>
              <p className="text-sm text-gray-500">
                Make sure your products have inventory data configured in the database.
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 p-12">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Products Match Your Filters</h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A0E0] focus:ring-[#00A0E0] focus:ring-offset-0"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Price</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Sold</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Last Updated</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleSelectProduct(product.id)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A0E0] focus:ring-[#00A0E0] focus:ring-offset-0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-10 h-10 object-contain rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">{product.name}</p>
                                {(toNumber(product.selling_price) === 0 || toNumber(product.cost_price) === 0) && (
                                  <AlertTriangle className="h-3 w-3 text-amber-400" title="Missing price data" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-300">{product.categories[0] || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-white">${money(product.selling_price)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => adjustStock(product.id, -1)}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <Minus className="h-4 w-4 text-red-400" />
                            </button>
                            <span className={`text-sm font-semibold ${toNumber(product.qty_in_stock) <= 5 ? 'text-amber-400' : 'text-white'}`}>
                              {int(product.qty_in_stock)}
                            </span>
                            <button
                              onClick={() => adjustStock(product.id, 1)}
                              className="p-1 hover:bg-green-500/20 rounded"
                            >
                              <Plus className="h-4 w-4 text-green-400" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-300">{int(product.qty_sold)}</td>
                        <td className="px-4 py-3 text-center">
                          {product.is_in_stock ? (
                            <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-300">
                              In Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-300">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-400">
                            {product.updated_at
                              ? new Date(product.updated_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className="p-1.5 hover:bg-[#00A0E0]/20 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-[#00A0E0]" />
                            </button>
                            <button
                              onClick={() => toggleActive(product.id, product.is_in_stock)}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors"
                              title={product.is_in_stock ? 'Hide' : 'Show'}
                            >
                              {product.is_in_stock ? (
                                <Eye className="h-4 w-4 text-gray-400" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </td>
                      </>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-400 text-center px-4 py-3">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
        )}
    </div>
  );
}
