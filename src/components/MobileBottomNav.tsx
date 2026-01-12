import { Home, List, ShoppingCart, HelpCircle, ShoppingCart as CartIcon, Lock } from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
  showAddToCart?: boolean;
  onAddToCart?: () => void;
  addingToCart?: boolean;
  isOutOfStock?: boolean;
}

export default function MobileBottomNav({
  currentPage,
  onNavigate,
  cartCount,
  showAddToCart = false,
  onAddToCart,
  addingToCart = false,
  isOutOfStock = false
}: MobileBottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalogue', label: 'Shop', icon: List },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'legal', label: 'FAQ', icon: HelpCircle },
    { id: 'admin-login', label: 'Admin', icon: Lock }
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0f18]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-safe">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-[#00A0E0] bg-[#00A0E0]/10'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] rounded-full shadow-[0_0_10px_rgba(0,160,224,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showAddToCart && onAddToCart && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#05070b] via-[#05070b]/95 to-transparent pointer-events-none" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
          <div className="px-4 pt-3 pb-[72px]">
            <button
              onClick={onAddToCart}
              disabled={addingToCart || isOutOfStock}
              className={`w-full py-3.5 text-white rounded-xl font-semibold text-base shadow-[0_0_30px_rgba(0,160,224,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 pointer-events-auto transition-transform ${
                isOutOfStock ? 'bg-gray-700' : 'bg-gradient-to-r from-[#00A0E0] to-[#11D0FF]'
              }`}
            >
              <CartIcon className="h-5 w-5" />
              <span>{isOutOfStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
