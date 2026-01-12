import { useState } from 'react';
import { ShoppingCart, Eye, CheckCircle, XCircle, Package } from 'lucide-react';
import VialPlaceholder from './VialPlaceholder';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    short_name: string;
    image_url?: string | null;
    selling_price?: number;
    price_cad?: number;
    category_names: string[];
    benefits_summary?: string;
    qty_in_stock: number | null;
  };
  onNavigate: (page: string, slug: string) => void;
  onAddToCart: (productId: string, productName: string, isInStock: boolean) => void;
  isAdding: boolean;
}

const trustMessages = [
  'Inventory-tracked',
  'Discreet shipping',
  'Secure checkout',
  'Quality-controlled batches',
];

export default function ProductCard({ product, onNavigate, onAddToCart, isAdding }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [trustMessage] = useState(() => trustMessages[Math.floor(Math.random() * trustMessages.length)]);

  const isInStock = product.qty_in_stock !== null && product.qty_in_stock > 0;
  const isLowStock = isInStock && product.qty_in_stock !== null && product.qty_in_stock < 5;
  const price = (product.selling_price || product.price_cad || 0).toFixed(2);

  const getStockBadge = () => {
    if (!isInStock) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800/90 border border-gray-700/50 rounded-lg backdrop-blur-sm">
          <XCircle className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-300">Out of Stock</span>
        </div>
      );
    }

    if (isLowStock) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/40 border border-amber-500/40 rounded-lg backdrop-blur-sm">
          <Package className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">Low Stock</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-900/30 border border-green-500/40 rounded-lg backdrop-blur-sm">
        <CheckCircle className="h-3.5 w-3.5 text-green-400" />
        <span className="text-xs font-semibold text-green-300">In Stock</span>
      </div>
    );
  };

  return (
    <div
      className={`group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden transition-all duration-300 flex flex-col ${
        !isInStock ? 'opacity-70' : 'hover:border-[#00A0E0]/50 hover:shadow-[0_20px_60px_rgba(0,160,224,0.2)]'
      } ${prefersReducedMotion ? '' : isInStock ? 'hover:-translate-y-1' : ''}`}
    >
      <div className="relative">
        <div className="absolute top-3 right-3 z-20">
          {getStockBadge()}
        </div>

        <div
          onClick={() => onNavigate('product', product.slug)}
          className="cursor-pointer relative w-full aspect-square bg-gradient-to-b from-[#0B0D12] to-[#050608] overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br from-[#00A0E0]/0 to-[#00A0E0]/0 transition-all duration-500 z-[5] ${
            isInStock ? 'group-hover:from-[#00A0E0]/8 group-hover:to-transparent' : ''
          }`} />

          {!isInStock && (
            <div className="absolute inset-0 bg-black/50 z-10" />
          )}

          {product.image_url ? (
            <img
              src={product.image_url}
              alt={`${product.name} research peptide`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-contain p-8 transition-all duration-500 ${
                isInStock ? 'group-hover:scale-105 group-hover:brightness-110' : ''
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <VialPlaceholder shortName={product.short_name} />
            </div>
          )}

          {isInStock && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5" />
                <span className="text-sm font-medium">View Details</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {product.category_names.length > 0 && (
          <div className="mb-2">
            <span className="inline-block px-2.5 py-1 bg-[#00A0E0]/10 border border-[#00A0E0]/30 rounded-full text-xs text-[#00A0E0] font-medium">
              {product.category_names[0]}
            </span>
          </div>
        )}

        <h3
          onClick={() => onNavigate('product', product.slug)}
          className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-[#00A0E0] transition-colors leading-tight line-clamp-2 cursor-pointer min-h-[3rem]"
        >
          {product.name}
        </h3>

        {product.benefits_summary && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {product.benefits_summary}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-white">
            ${price}
          </span>
          <span className="text-xs text-gray-500">CAD</span>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id, product.name, !!isInStock);
            }}
            disabled={isAdding || !isInStock}
            className={`w-full py-3 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isInStock
                ? 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] active:scale-[0.98] hover:brightness-110'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            } disabled:opacity-50`}
            style={{ minHeight: '44px' }}
          >
            {isAdding ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                <span>Adding...</span>
              </>
            ) : !isInStock ? (
              <>
                <XCircle className="h-4 w-4" />
                <span>Out of Stock</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Buy Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => onNavigate('product', product.slug)}
            className="w-full py-2.5 text-sm font-medium text-gray-300 border border-white/20 rounded-lg hover:bg-white/5 hover:border-[#00A0E0]/50 hover:text-[#00A0E0] transition-all duration-300"
          >
            View Details
          </button>

          <p className="text-[10px] text-gray-500 text-center mt-2">
            {trustMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
