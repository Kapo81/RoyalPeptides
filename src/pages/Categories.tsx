import { useEffect, useState } from 'react';
import { Shield, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import VialPlaceholder from '../components/VialPlaceholder';

interface CategoriesProps {
  onNavigate: (page: string, productSlug?: string) => void;
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

export default function Categories({ onNavigate }: CategoriesProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategoriesWithProducts();
  }, []);

  const fetchCategoriesWithProducts = async () => {
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (catError) {
      console.error('Error fetching categories:', catError);
      setLoading(false);
      return;
    }

    const categoriesWithProducts: CategoryWithProducts[] = [];

    for (const category of categoriesData || []) {
      const { data: productCats, error: pcError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', category.id);

      if (pcError) {
        console.error('Error fetching product categories:', pcError);
        continue;
      }

      const productIds = productCats?.map(pc => pc.product_id) || [];

      if (productIds.length > 0) {
        const { data: products, error: prodError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .order('name');

        if (prodError) {
          console.error('Error fetching products:', prodError);
          continue;
        }

        categoriesWithProducts.push({
          ...category,
          products: products || [],
        });
      } else {
        categoriesWithProducts.push({
          ...category,
          products: [],
        });
      }
    }

    setCategories(categoriesWithProducts);
    setExpandedCategories(new Set(categoriesWithProducts.map(c => c.id)));
    setLoading(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A0E0] mx-auto mb-4"></div>
          <p className="text-gray-400 tracking-wide">{t('categories.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] pt-20">
      <div className="relative bg-gradient-to-b from-[#050608] via-[#0B0D12] to-[#050608] text-white py-10 sm:py-16 md:py-20 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,160,224,0.1)_0%,_transparent_60%)] animate-pulse" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#00A0E0]/5 rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#11D0FF]/5 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center mb-4 md:mb-6 animate-[fadeInDown_1s_ease-out]">
            <FlaskConical className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#00A0E0] mr-3 md:mr-4 animate-[float_4s_ease-in-out_infinite]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide">{t('categories.title')}</h1>
          </div>
          <div className="h-px w-48 md:w-64 mx-auto bg-gradient-to-r from-transparent via-[#00A0E0] to-transparent mb-4 md:mb-6 shadow-[0_0_15px_rgba(0,160,224,0.5)] animate-[expandWidth_1s_ease-out_0.2s_both]" />
          <p className="text-[#F5F7FA]/70 text-base md:text-lg text-center tracking-wide animate-[fadeInUp_1s_ease-out_0.4s_both]">
            {t('categories.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 md:py-16">
        <div className="space-y-4 md:space-y-8">
          {categories.map((category, index) => {
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div
                key={category.id}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 overflow-hidden hover:border-[#00A0E0]/30 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,160,224,0.2)] animate-[fadeInUp_0.6s_ease-out]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 md:py-6 flex items-center justify-between hover:bg-white/5 transition-all duration-300 active:bg-white/10"
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="h-8 md:h-12 w-1 bg-gradient-to-b from-[#00A0E0] via-cyan-400 to-teal-400 rounded shadow-[0_0_10px_rgba(0,147,208,0.5)]"></div>
                    <div className="text-left">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wide">{category.name}</h2>
                      {category.description && (
                        <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-none">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                    <span className="text-xs md:text-sm text-gray-400 hidden sm:block">
                      {category.products.length} {category.products.length === 1 ? t('categories.product') : t('categories.products')}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[#00A0E0]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#00A0E0]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-6 md:px-8 pb-4 md:pb-8">
                    <div className="h-px bg-gradient-to-r from-[#00A0E0] via-cyan-400 to-teal-400 mb-4 md:mb-8 shadow-[0_0_10px_rgba(0,147,208,0.3)]"></div>

                    {category.products.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 md:py-12 text-sm md:text-base">
                        {t('categories.noProducts')}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                        {category.products.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => onNavigate('product', product.slug)}
                            className="group bg-gradient-to-br from-[#0B0D12]/60 to-[#0B0D12]/40 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl overflow-hidden hover:border-[#00A0E0]/50 hover:shadow-[0_0_30px_rgba(0,147,208,0.2)] transition-all duration-500 cursor-pointer relative flex flex-col md:hover:scale-[1.02] md:hover:-translate-y-1 active:scale-95"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00A0E0]/0 to-[#00A0E0]/0 group-hover:from-[#00A0E0]/5 group-hover:to-transparent transition-all duration-500" />

                            <div className="relative w-full aspect-square bg-gradient-to-b from-[#0B0D12] to-[#050608] overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#00A0E0]/0 to-[#11D0FF]/0 group-hover:from-[#00A0E0]/5 group-hover:to-[#11D0FF]/5 transition-all duration-500 z-[5]" />
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  loading="lazy"
                                  className="absolute inset-0 w-full h-full object-contain p-4 md:p-8 md:group-hover:scale-110 md:group-hover:rotate-2 transition-all duration-500"
                                  style={{ display: 'block' }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <VialPlaceholder shortName={product.short_name} />
                                </div>
                              )}
                            </div>

                            <div className="p-3 md:p-6 relative z-10 flex-grow">
                              <h3 className="font-bold text-white group-hover:text-[#00A0E0] transition-colors text-sm md:text-lg tracking-wide mb-1 md:mb-2 line-clamp-2">
                                {product.name}
                              </h3>

                              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3 truncate">
                                {product.dosage}
                              </p>

                              <div className="flex items-center justify-between text-[10px] md:text-xs pt-2 md:pt-3 border-t border-white/10">
                                <span className="text-gray-500">Purity:</span>
                                <span className="font-semibold text-[#00A0E0]">{product.purity}</span>
                              </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-[#00A0E0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_15px_rgba(0,147,208,0.8)]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
