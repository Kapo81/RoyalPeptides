import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  benefits_summary: string;
  selling_price: number;
  cost_price: number;
  image_url: string;
  is_in_stock: boolean;
  qty_in_stock: number;
  form: string;
  dosage: string;
  purity: string;
  storage: string;
  category_ids: string[];
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId?: string;
  initialData?: Partial<ProductFormData>;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  productId,
  initialData,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    benefits_summary: '',
    selling_price: 0,
    cost_price: 0,
    image_url: '',
    is_in_stock: true,
    qty_in_stock: 100,
    form: 'vial',
    dosage: '5mg',
    purity: '>98% research grade',
    storage: 'Store at -20°C. Protect from light.',
    category_ids: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setFormData((prev) => ({ ...prev, ...initialData }));
      }
      if (productId) {
        fetchProductData(productId);
      }
    }
  }, [isOpen, productId]);

  useEffect(() => {
    if (formData.name && !productId) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, productId]);

  const fetchCategories = async () => {
    console.log('[ProductFormModal] Fetching categories...');
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (!error && data) {
      console.log('[ProductFormModal] Categories fetched:', data.length);
      setCategories(data);
    } else {
      console.error('[ProductFormModal] Category fetch error:', error);
    }
  };

  const fetchProductData = async (id: string) => {
    console.log('[ProductFormModal] Fetching product data for:', id);

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (productError) {
      console.error('[ProductFormModal] Product fetch error:', productError);
      setError('Failed to load product data');
      return;
    }

    if (product) {
      const { data: productCats } = await supabase
        .from('product_categories')
        .select('category_id')
        .eq('product_id', id);

      const categoryIds = productCats?.map((pc) => pc.category_id) || [];

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        benefits_summary: product.benefits_summary || '',
        selling_price: product.selling_price || 0,
        cost_price: product.cost_price || 0,
        image_url: product.image_url || '',
        is_in_stock: product.is_in_stock ?? true,
        qty_in_stock: product.qty_in_stock || 0,
        form: product.form || 'vial',
        dosage: product.dosage || '5mg',
        purity: product.purity || '>98% research grade',
        storage: product.storage || 'Store at -20°C. Protect from light.',
        category_ids: categoryIds,
      });

      console.log('[ProductFormModal] Product data loaded successfully');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    console.log('[ProductFormModal] Creating new category:', newCategoryName);

    const slug = newCategoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: newCategoryName,
        name_en: newCategoryName,
        slug,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[ProductFormModal] Category creation error:', error);
      setError(`Failed to create category: ${error.message}`);
      return;
    }

    if (data) {
      console.log('[ProductFormModal] Category created:', data.id);
      setCategories((prev) => [...prev, { id: data.id, name: data.name }]);
      setFormData((prev) => ({
        ...prev,
        category_ids: [...prev.category_ids, data.id],
      }));
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[ProductFormModal] Submitting form...', { productId, formData });

    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError('Product slug is required');
      setLoading(false);
      return;
    }

    if (formData.selling_price <= 0) {
      setError('Selling price must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        benefits_summary: formData.benefits_summary.trim(),
        selling_price: formData.selling_price,
        cost_price: formData.cost_price,
        image_url: formData.image_url.trim(),
        is_in_stock: formData.is_in_stock,
        qty_in_stock: formData.qty_in_stock,
        form: formData.form,
        dosage: formData.dosage,
        purity: formData.purity,
        storage: formData.storage,
        qty_sold: 0,
        price_cad: formData.selling_price,
        updated_at: new Date().toISOString(),
      };

      let savedProductId = productId;

      if (productId) {
        console.log('[ProductFormModal] Updating product:', productId);
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (updateError) {
          throw updateError;
        }

        console.log('[ProductFormModal] Product updated successfully');
      } else {
        console.log('[ProductFormModal] Creating new product');
        const { data, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .maybeSingle();

        if (insertError) {
          throw insertError;
        }

        if (data) {
          savedProductId = data.id;
          console.log('[ProductFormModal] Product created:', savedProductId);
        }
      }

      if (savedProductId && formData.category_ids.length > 0) {
        console.log('[ProductFormModal] Updating product categories');

        await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', savedProductId);

        const categoryInserts = formData.category_ids.map((catId) => ({
          product_id: savedProductId,
          category_id: catId,
        }));

        const { error: catError } = await supabase
          .from('product_categories')
          .insert(categoryInserts);

        if (catError) {
          console.error('[ProductFormModal] Category link error:', catError);
        } else {
          console.log('[ProductFormModal] Categories linked successfully');
        }
      }

      console.log('[ProductFormModal] Operation completed successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[ProductFormModal] Save error:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-3xl bg-gradient-to-br from-[#0B0D12] to-[#05070b] rounded-xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">
              {productId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., BPC-157"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., bpc-157"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                placeholder="Brief description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Benefits Summary
              </label>
              <textarea
                value={formData.benefits_summary}
                onChange={(e) => setFormData({ ...formData, benefits_summary: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                placeholder="Key benefits and features"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selling Price (CAD) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="0.00"
                  required
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
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.qty_in_stock}
                  onChange={(e) => setFormData({ ...formData, qty_in_stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Form
                </label>
                <select
                  value={formData.form}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00A0E0]/50"
                >
                  <option value="vial">Vial</option>
                  <option value="bottle">Bottle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                  placeholder="e.g., 5mg"
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
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                placeholder="https://example.com/image.png"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Categories
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="flex items-center gap-1 text-xs text-[#00A0E0] hover:text-[#11D0FF] transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Category</span>
                </button>
              </div>

              {showNewCategory && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#00A0E0]/50"
                    placeholder="Category name"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-4 py-2 bg-[#00A0E0]/20 border border-[#00A0E0]/50 text-[#00A0E0] rounded-lg hover:bg-[#00A0E0]/30 transition-colors text-sm"
                  >
                    Create
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      formData.category_ids.includes(category.id)
                        ? 'bg-[#00A0E0]/20 border-[#00A0E0]/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A0E0] focus:ring-[#00A0E0] focus:ring-offset-0"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_in_stock"
                checked={formData.is_in_stock}
                onChange={(e) => setFormData({ ...formData, is_in_stock: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A0E0] focus:ring-[#00A0E0] focus:ring-offset-0"
              />
              <label htmlFor="is_in_stock" className="text-sm text-gray-300">
                Product is in stock
              </label>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg hover:shadow-[0_0_20px_rgba(0,160,224,0.4)] transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
