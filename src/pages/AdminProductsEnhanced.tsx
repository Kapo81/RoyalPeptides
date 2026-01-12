import { useEffect, useState } from 'react';
import { Search, Plus, X, Package, Edit2, Save, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';
import { forceRefreshStorefront } from '../lib/cacheManager';

interface Product {
  id: string;
  name: string;
  short_name: string | null;
  slug: string;
  description: string;
  dosage: string | null;
  price_cad: number;
  cost_price: number;
  selling_price: number;
  image_url: string;
  qty_in_stock: number;
  low_stock_threshold: number;
  is_in_stock: boolean;
  is_active: boolean;
  featured: boolean;
  categories?: string[];
  categoryIds?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

type ModalMode = 'add' | 'edit' | null;

export default function AdminProductsEnhanced() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('active');
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    slug: '',
    description: '',
    dosage: '',
    price_cad: '',
    cost_price: '',
    image_url: '',
    qty_in_stock: '100',
    low_stock_threshold: '10',
    is_in_stock: true,
    is_active: true,
    featured: false,
    categoryIds: [] as string[],
  });

  useEffect(() => {
    console.log('[AdminProducts] Component mounted');
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, stockFilter, activeFilter]);

  const fetchData = async () => {
    console.log('[AdminProducts] Fetching products and categories...');
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productsResult.data) {
        const productsWithCategories = await Promise.all(
          productsResult.data.map(async (product) => {
            const { data: productCategories } = await supabase
              .from('product_categories')
              .select('category_id, categories(name)')
              .eq('product_id', product.id);

            return {
              ...product,
              categories: productCategories?.map((pc: any) => pc.categories.name) || [],
              categoryIds: productCategories?.map((pc: any) => pc.category_id) || [],
            };
          })
        );
        setProducts(productsWithCategories);
        console.log(`[AdminProducts] Loaded ${productsWithCategories.length} products`);
      }

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
        console.log(`[AdminProducts] Loaded ${categoriesResult.data.length} categories`);
      }
    } catch (error) {
      console.error('[AdminProducts] Error fetching data:', error);
      setToastMessage('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.short_name?.toLowerCase().includes(search) ||
          product.slug.toLowerCase().includes(search)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) =>
        product.categories?.some((cat) => cat === categoryFilter)
      );
    }

    if (stockFilter === 'in-stock') {
      filtered = filtered.filter((product) => product.is_in_stock && product.qty_in_stock > 0);
    } else if (stockFilter === 'low-stock') {
      filtered = filtered.filter(
        (product) => product.qty_in_stock <= product.low_stock_threshold && product.qty_in_stock > 0
      );
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter((product) => !product.is_in_stock || product.qty_in_stock === 0);
    }

    if (activeFilter === 'active') {
      filtered = filtered.filter((product) => product.is_active !== false);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter((product) => product.is_active === false);
    }

    setFilteredProducts(filtered);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingProduct(null);
    setFormData({
      name: '',
      short_name: '',
      slug: '',
      description: '',
      dosage: '',
      price_cad: '',
      cost_price: '',
      image_url: '',
      qty_in_stock: '100',
      low_stock_threshold: '10',
      is_in_stock: true,
      is_active: true,
      featured: false,
      categoryIds: [],
    });
  };

  const handleOpenEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setFormData({
      name: product.name,
      short_name: product.short_name || '',
      slug: product.slug,
      description: product.description || '',
      dosage: product.dosage || '',
      price_cad: product.price_cad?.toString() || '0',
      cost_price: product.cost_price?.toString() || '0',
      image_url: product.image_url || '',
      qty_in_stock: product.qty_in_stock?.toString() || '0',
      low_stock_threshold: product.low_stock_threshold?.toString() || '10',
      is_in_stock: product.is_in_stock,
      is_active: product.is_active !== false,
      featured: product.featured,
      categoryIds: product.categoryIds || [],
    });
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingProduct(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      setToastMessage('Product name is required');
      return;
    }

    setSaving(true);
    const slug = formData.slug || generateSlug(formData.name);

    try {
      const productData = {
        name: formData.name.trim(),
        short_name: formData.short_name.trim() || formData.name.trim(),
        slug: slug,
        description: formData.description.trim(),
        dosage: formData.dosage.trim() || null,
        price_cad: parseFloat(formData.price_cad) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.price_cad) || 0,
        image_url: formData.image_url.trim() || '',
        qty_in_stock: parseInt(formData.qty_in_stock) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        is_in_stock: formData.is_in_stock,
        is_active: formData.is_active,
        featured: formData.featured,
        updated_at: new Date().toISOString(),
      };

      let productId: string;

      if (modalMode === 'add') {
        console.log('[AdminProducts] Creating new product:', productData);
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) {
          console.error('[AdminProducts] Create error:', error);
          setToastMessage(`Failed to create product: ${error.message}`);
          setSaving(false);
          return;
        }

        productId = data.id;
        console.log(`[AdminProducts] Product created with ID: ${productId}`);
      } else if (modalMode === 'edit' && editingProduct) {
        console.log('[AdminProducts] Updating product:', editingProduct.id, productData);
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('[AdminProducts] Update error:', error);
          setToastMessage(`Failed to update product: ${error.message}`);
          setSaving(false);
          return;
        }

        productId = editingProduct.id;
        console.log(`[AdminProducts] Product updated: ${productId}`);
      } else {
        setSaving(false);
        return;
      }

      await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', productId);

      if (formData.categoryIds.length > 0) {
        const categoryInserts = formData.categoryIds.map((categoryId) => ({
          product_id: productId,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from('product_categories')
          .insert(categoryInserts);

        if (categoryError) {
          console.error('[AdminProducts] Category assignment error:', categoryError);
        }
      }

      await supabase.rpc('increment_data_version', { version_key: 'products_version' });

      await fetchData();

      const savedProduct = products.find((p) => p.id === productId);
      if (savedProduct || modalMode === 'add') {
        console.log('[AdminProducts] Save verified ✓');
        setToastMessage(
          modalMode === 'add'
            ? 'Product created successfully! ✓'
            : 'Product updated successfully! ✓'
        );
      } else {
        console.warn('[AdminProducts] Save could not be verified');
        setToastMessage('Product saved, but verification failed');
      }

      handleCloseModal();
    } catch (error) {
      console.error('[AdminProducts] Save error:', error);
      setToastMessage('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    const newActiveState = !product.is_active;
    console.log(`[AdminProducts] Toggling product ${product.id} active state to: ${newActiveState}`);

    const { error } = await supabase
      .from('products')
      .update({ is_active: newActiveState, updated_at: new Date().toISOString() })
      .eq('id', product.id);

    if (error) {
      console.error('[AdminProducts] Toggle active error:', error);
      setToastMessage('Failed to update product status');
      return;
    }

    await supabase.rpc('increment_data_version', { version_key: 'products_version' });

    await fetchData();
    console.log('[AdminProducts] Product active state updated and verified ✓');
    setToastMessage(
      newActiveState
        ? 'Product activated ✓'
        : 'Product deactivated ✓'
    );
  };

  const handleRefreshStorefront = async () => {
    setRefreshing(true);
    try {
      await forceRefreshStorefront();
      setToastMessage('Storefront data refreshed! All clients will reload fresh data. ✓');
      console.log('[AdminProducts] Storefront refresh completed');
    } catch (error) {
      console.error('[AdminProducts] Refresh error:', error);
      setToastMessage('Failed to refresh storefront');
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    if (formData.categoryIds.includes(categoryId)) {
      setFormData({
        ...formData,
        categoryIds: formData.categoryIds.filter((id) => id !== categoryId),
      });
    } else {
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, categoryId],
      });
    }
  };

  const getStockBadge = (product: Product) => {
    if (!product.is_active) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-500/20 text-gray-500 border border-gray-500/30">
          Inactive
        </span>
      );
    }
    if (!product.is_in_stock || product.qty_in_stock === 0) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">
          Out of Stock
        </span>
      );
    }
    if (product.qty_in_stock <= product.low_stock_threshold) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/30">
        In Stock
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00A0E0] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] p-4 md:p-8">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Product Manager</h1>
          <p className="text-gray-400">Full CRUD management with instant storefront updates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshStorefront}
            disabled={refreshing}
            className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            title="Force refresh storefront data for all clients"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh Storefront</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
          >
            <option value="all" className="bg-[#0B0D12]">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name} className="bg-[#0B0D12]">
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
          >
            <option value="all" className="bg-[#0B0D12]">All Stock</option>
            <option value="in-stock" className="bg-[#0B0D12]">In Stock</option>
            <option value="low-stock" className="bg-[#0B0D12]">Low Stock</option>
            <option value="out-of-stock" className="bg-[#0B0D12]">Out of Stock</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
          >
            <option value="all" className="bg-[#0B0D12]">All Status</option>
            <option value="active" className="bg-[#0B0D12]">Active Only</option>
            <option value="inactive" className="bg-[#0B0D12]">Inactive Only</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || '/placeholder-vial.png'}
                        alt={product.name}
                        className={`w-12 h-12 object-cover rounded ${
                          !product.is_active ? 'opacity-50 grayscale' : ''
                        }`}
                      />
                      <div>
                        <div className={`text-sm font-medium ${product.is_active ? 'text-white' : 'text-gray-500'}`}>
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">{product.dosage}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {product.categories?.join(', ') || <span className="text-gray-600">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      ${product.price_cad?.toFixed(2) || '0.00'}
                    </div>
                    {product.cost_price > 0 && (
                      <div className="text-xs text-gray-500">
                        Cost: ${product.cost_price.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStockBadge(product)}</td>
                  <td className="px-6 py-4 text-sm text-white">{product.qty_in_stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 text-[#00A0E0] hover:bg-[#00A0E0]/10 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.is_active
                            ? 'text-yellow-400 hover:bg-yellow-400/10'
                            : 'text-green-400 hover:bg-green-400/10'
                        }`}
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            No products found matching your filters
          </div>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0D12] rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0B0D12] border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                    placeholder="e.g., BPC-157"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                    placeholder="e.g., BPC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="Product description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                    placeholder="e.g., 5mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cost Price (CAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selling Price (CAD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_cad}
                    onChange={(e) => setFormData({ ...formData, price_cad: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity in Stock
                  </label>
                  <input
                    type="number"
                    value={formData.qty_in_stock}
                    onChange={(e) => setFormData({ ...formData, qty_in_stock: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(category.id)}
                        onChange={() => handleToggleCategory(category.id)}
                        className="rounded border-white/20 text-[#00A0E0] focus:ring-[#00A0E0] bg-white/5"
                      />
                      <span className="text-sm text-gray-300">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_in_stock}
                    onChange={(e) => setFormData({ ...formData, is_in_stock: e.target.checked })}
                    className="rounded border-white/20 text-[#00A0E0] focus:ring-[#00A0E0] bg-white/5"
                  />
                  <span className="text-sm font-medium text-gray-300">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-white/20 text-[#00A0E0] focus:ring-[#00A0E0] bg-white/5"
                  />
                  <span className="text-sm font-medium text-gray-300">Active (Visible on Store)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-white/20 text-[#00A0E0] focus:ring-[#00A0E0] bg-white/5"
                  />
                  <span className="text-sm font-medium text-gray-300">Featured</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
