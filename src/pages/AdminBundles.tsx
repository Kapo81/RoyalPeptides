import { useEffect, useState } from 'react';
import { Plus, Edit2, Save, X, Trash2, Package, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface Bundle {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  synergy_explanation: string;
  ideal_for: string;
  category: string;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price_cad: number;
  image_url: string;
}

interface BundleProduct {
  product_id: string;
  quantity: number;
  product?: Product;
}

const BUNDLE_CATEGORIES = [
  'Recovery',
  'Fat Loss',
  'Nootropics',
  'Libido',
  'Wellness',
  'General',
];

export default function AdminBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [bundleProducts, setBundleProducts] = useState<BundleProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSynergy, setFormSynergy] = useState('');
  const [formIdealFor, setFormIdealFor] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formDiscount, setFormDiscount] = useState('15');
  const [formProducts, setFormProducts] = useState<BundleProduct[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bundlesResult, productsResult] = await Promise.all([
        supabase.from('bundles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, price_cad, image_url').order('name'),
      ]);

      if (bundlesResult.data) {
        setBundles(bundlesResult.data);
      }

      if (productsResult.data) {
        setProducts(productsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBundleProducts = async (bundleId: string) => {
    const { data, error } = await supabase
      .from('bundle_products')
      .select('product_id, quantity')
      .eq('bundle_id', bundleId);

    if (error) {
      console.error('Error fetching bundle products:', error);
      return;
    }

    // Enrich with product details
    const enrichedProducts = data.map((bp) => {
      const product = products.find((p) => p.id === bp.product_id);
      return {
        product_id: bp.product_id,
        quantity: bp.quantity,
        product,
      };
    });

    setBundleProducts(enrichedProducts);
  };

  const handleBundleClick = async (bundle: Bundle) => {
    setSelectedBundle(bundle);
    await fetchBundleProducts(bundle.id);
  };

  const handleNewBundle = () => {
    setShowForm(true);
    setIsEditing(false);
    resetForm();
  };

  const handleEditBundle = async (bundle: Bundle) => {
    setShowForm(true);
    setIsEditing(true);
    setSelectedBundle(bundle);

    // Populate form
    setFormName(bundle.name);
    setFormSlug(bundle.slug);
    setFormTagline(bundle.tagline || '');
    setFormDescription(bundle.description || '');
    setFormSynergy(bundle.synergy_explanation || '');
    setFormIdealFor(bundle.ideal_for || '');
    setFormCategory(bundle.category || 'General');
    setFormDiscount(bundle.discount_percentage.toString());

    // Fetch and populate products
    const { data } = await supabase
      .from('bundle_products')
      .select('product_id, quantity')
      .eq('bundle_id', bundle.id);

    if (data) {
      setFormProducts(data);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormTagline('');
    setFormDescription('');
    setFormSynergy('');
    setFormIdealFor('');
    setFormCategory('General');
    setFormDiscount('15');
    setFormProducts([]);
  };

  const handleAddProduct = () => {
    if (products.length > 0) {
      setFormProducts([...formProducts, { product_id: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setFormProducts(formProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const updated = [...formProducts];
    updated[index] = { ...updated[index], [field]: value };
    setFormProducts(updated);
  };

  const calculatePrices = () => {
    let regularTotal = 0;
    formProducts.forEach((bp) => {
      const product = products.find((p) => p.id === bp.product_id);
      if (product) {
        regularTotal += product.price_cad * bp.quantity;
      }
    });

    const discount = parseFloat(formDiscount) || 0;
    const discountedTotal = regularTotal * (1 - discount / 100);
    const savings = regularTotal - discountedTotal;

    return { regularTotal, discountedTotal, savings };
  };

  const handleSaveBundle = async () => {
    if (!formName || !formSlug || formProducts.length === 0) {
      setToastMessage('Please fill in all required fields and add at least one product');
      return;
    }

    const bundleData = {
      name: formName,
      slug: formSlug,
      tagline: formTagline,
      description: formDescription,
      synergy_explanation: formSynergy,
      ideal_for: formIdealFor,
      category: formCategory,
      discount_percentage: parseFloat(formDiscount),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing && selectedBundle) {
        // Update existing bundle
        const { error } = await supabase
          .from('bundles')
          .update(bundleData)
          .eq('id', selectedBundle.id);

        if (error) throw error;

        // Delete old bundle products
        await supabase.from('bundle_products').delete().eq('bundle_id', selectedBundle.id);

        // Insert new bundle products
        const productInserts = formProducts.map((bp) => ({
          bundle_id: selectedBundle.id,
          product_id: bp.product_id,
          quantity: bp.quantity,
        }));

        await supabase.from('bundle_products').insert(productInserts);

        setToastMessage('Bundle updated successfully!');
      } else {
        // Create new bundle
        const { data: newBundle, error } = await supabase
          .from('bundles')
          .insert([bundleData])
          .select()
          .single();

        if (error) throw error;

        // Insert bundle products
        const productInserts = formProducts.map((bp) => ({
          bundle_id: newBundle.id,
          product_id: bp.product_id,
          quantity: bp.quantity,
        }));

        await supabase.from('bundle_products').insert(productInserts);

        setToastMessage('Bundle created successfully!');
      }

      setShowForm(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving bundle:', error);
      setToastMessage('Failed to save bundle. Please try again');
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete bundle products first
      await supabase.from('bundle_products').delete().eq('bundle_id', bundleId);

      // Delete bundle
      const { error } = await supabase.from('bundles').delete().eq('id', bundleId);

      if (error) throw error;

      setToastMessage('Bundle deleted successfully!');
      setSelectedBundle(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting bundle:', error);
      setToastMessage('Failed to delete bundle. Please try again');
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Recovery: 'bg-blue-100 text-blue-700',
      'Fat Loss': 'bg-red-100 text-red-700',
      Nootropics: 'bg-purple-100 text-purple-700',
      Libido: 'bg-pink-100 text-pink-700',
      Wellness: 'bg-green-100 text-green-700',
      General: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading bundles...</div>;
  }

  return (
    <div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-500 mt-2">Create and manage product bundles</p>
        </div>
        <button
          onClick={handleNewBundle}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          New Bundle
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Bundle' : 'Create New Bundle'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Ultimate Recovery Stack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="ultimate-recovery-stack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="Short, catchy description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the bundle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Synergy Explanation
                </label>
                <textarea
                  value={formSynergy}
                  onChange={(e) => setFormSynergy(e.target.value)}
                  rows={3}
                  placeholder="Explain how these products work together"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ideal For
                </label>
                <textarea
                  value={formIdealFor}
                  onChange={(e) => setFormIdealFor(e.target.value)}
                  rows={2}
                  placeholder="Who is this bundle perfect for?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {BUNDLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount % *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="20"
                    step="1"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bundle Products *
                  </label>
                  <button
                    onClick={handleAddProduct}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>

                <div className="space-y-3">
                  {formProducts.map((bp, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={bp.product_id}
                        onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${product.price_cad.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={bp.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {formProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                    No products added yet. Click "Add Product" to get started.
                  </div>
                )}
              </div>

              {formProducts.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Calculation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Regular Total:</span>
                      <span className="font-medium">${calculatePrices().regularTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount ({formDiscount}%):</span>
                      <span className="text-red-600">-${calculatePrices().savings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="font-semibold">Bundle Price:</span>
                      <span className="font-bold text-blue-600 text-lg">
                        ${calculatePrices().discountedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveBundle}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Save className="h-5 w-5" />
              {isEditing ? 'Update Bundle' : 'Create Bundle'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bundles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bundles created yet</p>
              <button
                onClick={handleNewBundle}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Create Your First Bundle
              </button>
            </div>
          ) : (
            bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{bundle.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryBadge(bundle.category)}`}>
                          {bundle.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${bundle.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {bundle.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {bundle.tagline && (
                        <p className="text-sm text-gray-600 mb-2">{bundle.tagline}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Discount: <span className="font-semibold text-blue-600">{bundle.discount_percentage}% off</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBundle(bundle)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit bundle"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBundle(bundle.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete bundle"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {bundle.description && (
                    <p className="text-sm text-gray-700 mb-4">{bundle.description}</p>
                  )}

                  <button
                    onClick={() => handleBundleClick(bundle)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedBundle?.id === bundle.id ? 'Hide Products' : 'View Products'}
                  </button>

                  {selectedBundle?.id === bundle.id && bundleProducts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Bundle Contents:</h4>
                      <div className="space-y-2">
                        {bundleProducts.map((bp) => (
                          <div key={bp.product_id} className="flex items-center gap-3">
                            {bp.product && (
                              <>
                                <img
                                  src={bp.product.image_url || '/placeholder-vial.png'}
                                  alt={bp.product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{bp.product.name}</p>
                                  <p className="text-xs text-gray-500">Quantity: {bp.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  ${(bp.product.price_cad * bp.quantity).toFixed(2)}
                                </p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
