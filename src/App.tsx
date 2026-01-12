import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Legal from './pages/Legal';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Shipping from './pages/Shipping';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminMain from './pages/AdminMain';
import AdminLogin from './pages/AdminLogin';
import Stacks from './pages/Stacks';
import { supabase, getSessionId } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [productSlug, setProductSlug] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('order');
    const orderIdParam = urlParams.get('order_id');

    if (orderIdParam) {
      setCurrentPage('payment-success');
      return;
    }

    if (paymentStatus === 'success' && orderId) {
      setOrderNumber(orderId);
      setCurrentPage('order-confirmation');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      alert('Payment was cancelled. You can try again or use e-Transfer as an alternative payment method.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchCartCount = async () => {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('session_id', sessionId);

    if (!error && data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const handleNavigate = (page: string, param?: string) => {
    setCurrentPage(page);
    if (param) {
      if (page === 'product') {
        setProductSlug(param);
      } else if (page === 'order-confirmation') {
        setOrderNumber(param);
      }
    }
    window.scrollTo(0, 0);
  };

  const handleCartUpdate = () => {
    fetchCartCount();
  };


  return (
    <div className="min-h-screen bg-[#050608]">
      {currentPage !== 'admin' && currentPage !== 'admin-login' && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} cartCount={cartCount} />
      )}

      {currentPage === 'home' && <Home onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />}
      {currentPage === 'shop' && <Shop onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />}
      {currentPage === 'cart' && <Cart onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />}
      {currentPage === 'catalogue' && <Catalogue onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />}
      {currentPage === 'stacks' && <Stacks onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />}
      {currentPage === 'product' && (
        <ProductDetail productSlug={productSlug} onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />
      )}
      {currentPage === 'checkout' && <Checkout onNavigate={handleNavigate} />}
      {currentPage === 'legal' && <Legal />}
      {currentPage === 'about' && <About onNavigate={handleNavigate} />}
      {currentPage === 'shipping' && <Shipping onNavigate={handleNavigate} />}
      {currentPage === 'order-confirmation' && <OrderConfirmation orderNumber={orderNumber} onNavigate={handleNavigate} />}
      {currentPage === 'payment-success' && <PaymentSuccess onNavigate={handleNavigate} />}
      {currentPage === 'admin-login' && <AdminLogin onNavigate={handleNavigate} />}
      {currentPage === 'admin' && <AdminMain onNavigate={handleNavigate} />}

      {currentPage !== 'admin' && currentPage !== 'admin-login' && <Footer onNavigate={handleNavigate} />}
      {currentPage !== 'admin' && currentPage !== 'admin-login' && (
        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          cartCount={cartCount}
        />
      )}
    </div>
  );
}

export default App;
