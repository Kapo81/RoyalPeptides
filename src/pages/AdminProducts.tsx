import { useEffect, useState } from 'react';
import { Search, Filter, X, Package, Edit2, Save, Download, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface Product {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  description: string;
  dosage: string;
  price_cad: number;
  cost_price: number;
  selling_price: number;
  image_url: string;
  qty_in_stock: number;
  low_stock_threshold: number;
  is_in_stock: boolean;
  featured: boolean;
  categories?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Edit form state
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [editedCostPrice, setEditedCostPrice] = useState('');
  const [editedSellingPrice, setEditedSellingPrice] = useState('');
  const [editedDosage, setEditedDosage] = useState('');
  const [editedQtyInStock, setEditedQtyInStock] = useState('');
  const [editedLowStockThreshold, setEditedLowStockThreshold] = useState('');
  const [editedIsActive, setEditedIsActive] = useState(true);
  const [editedCategories, setEditedCategories] = useState<string[]>([]);

  useEffect(() => {
    console.log('[AdminRoute] Mounted: /admin/products');
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const fetchData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productsResult.data) {
        // Fetch categories for each product
        const productsWithCategories = await Promise.all(
          productsResult.data.map(async (product) => {
            const { data: productCategories } = await supabase
              .from('product_categories')
              .select('category_id, categories(name)')
              .eq('product_id', product.id);

            return {
              ...product,
              categories: productCategories?.map((pc: any) => pc.categories.name) || [],
            };
          })
        );
        setProducts(productsWithCategories);
      }

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        (product) => product.qty_in_stock <= product.low_stock_threshold
      );
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter((product) => !product.is_in_stock || product.qty_in_stock === 0);
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    setEditedName(product.name);
    setEditedDescription(product.description || '');
    setEditedPrice(product.price_cad?.toString() || '0');
    setEditedCostPrice(product.cost_price?.toString() || '0');
    setEditedSellingPrice(product.selling_price?.toString() || product.price_cad?.toString() || '0');
    setEditedDosage(product.dosage || '');
    setEditedQtyInStock(product.qty_in_stock?.toString() || '0');
    setEditedLowStockThreshold(product.low_stock_threshold?.toString() || '5');
    setEditedIsActive(product.is_in_stock);

    // Fetch category IDs for this product
    const { data: productCategories } = await supabase
      .from('product_categories')
      .select('category_id')
      .eq('product_id', product.id);

    setEditedCategories(productCategories?.map((pc) => pc.category_id) || []);
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) return;

    const sellingPrice = parseFloat(editedSellingPrice);
    const updates = {
      name: editedName,
      description: editedDescription,
      cost_price: parseFloat(editedCostPrice),
      selling_price: sellingPrice,
      price_cad: sellingPrice,
      dosage: editedDosage,
      qty_in_stock: parseInt(editedQtyInStock),
      low_stock_threshold: parseInt(editedLowStockThreshold),
      is_in_stock: editedIsActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', selectedProduct.id);

    if (error) {
      console.error('Error updating product:', error);
      setToastMessage('Failed to update product');
      return;
    }

    // Update product categories
    // First, delete existing categories
    await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', selectedProduct.id);

    // Then insert new categories
    if (editedCategories.length > 0) {
      const categoryInserts = editedCategories.map((categoryId) => ({
        product_id: selectedProduct.id,
        category_id: categoryId,
      }));

      await supabase.from('product_categories').insert(categoryInserts);
    }

    setEditingProduct(false);
    fetchData();
    setToastMessage('Product updated successfully!');
  };

  const handleToggleCategory = (categoryId: string) => {
    if (editedCategories.includes(categoryId)) {
      setEditedCategories(editedCategories.filter((id) => id !== categoryId));
    } else {
      setEditedCategories([...editedCategories, categoryId]);
    }
  };

  const handleExportInventory = () => {
    setToastMessage('Export inventory feature coming soon!');
  };

  const getStockBadge = (product: Product) => {
    if (!product.is_in_stock || product.qty_in_stock === 0) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">Out of Stock</span>;
    }
    if (product.qty_in_stock <= product.low_stock_threshold) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">In Stock</span>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading products...</div>;
  }

  return (
    <div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-2">Manage inventory and product details</p>
        </div>
        <button
          onClick={handleExportInventory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="h-5 w-5" />
          Export Inventory
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center justify-center">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedProduct?.id === product.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || '/placeholder-vial.png'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.short_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {product.categories?.join(', ') || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">${product.selling_price?.toFixed(2) || product.price_cad?.toFixed(2) || '0.00'}</div>
                          {product.cost_price > 0 && (
                            <div className="text-xs text-gray-500">Cost: ${product.cost_price.toFixed(2)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStockBadge(product)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.qty_in_stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found matching your filters
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedProduct ? (
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {selectedProduct.image_url && (
                  <div className="flex justify-center">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedCategories.includes(category.id)}
                          onChange={() => handleToggleCategory(category.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedCostPrice}
                      onChange={(e) => setEditedCostPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (CAD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editedSellingPrice}
                      onChange={(e) => setEditedSellingPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={editedDosage}
                    onChange={(e) => setEditedDosage(e.target.value)}
                    placeholder="e.g., 5mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty in Stock
                    </label>
                    <input
                      type="number"
                      value={editedQtyInStock}
                      onChange={(e) => setEditedQtyInStock(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={editedLowStockThreshold}
                      onChange={(e) => setEditedLowStockThreshold(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedIsActive}
                      onChange={(e) => setEditedIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Product Active (In Stock)</span>
                  </label>
                </div>

                <button
                  onClick={handleSaveProduct}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Save className="h-5 w-5" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a product to edit details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
