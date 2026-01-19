import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
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
    parseUrlAndSetPage();

    const handlePopState = () => {
      parseUrlAndSetPage();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const parseUrlAndSetPage = () => {
    const path = window.location.pathname;
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
      return;
    } else if (paymentStatus === 'cancelled') {
      alert('Payment was cancelled. You can try again or use e-Transfer as an alternative payment method.');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (path === '/' || path === '') {
      setCurrentPage('home');
    } else if (path === '/catalogue') {
      setCurrentPage('catalogue');
    } else if (path === '/stacks') {
      setCurrentPage('stacks');
    } else if (path === '/shop') {
      setCurrentPage('shop');
    } else if (path === '/cart') {
      setCurrentPage('cart');
    } else if (path === '/checkout') {
      setCurrentPage('checkout');
    } else if (path === '/about') {
      setCurrentPage('about');
    } else if (path === '/shipping') {
      setCurrentPage('shipping');
    } else if (path === '/legal') {
      setCurrentPage('legal');
    } else if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/admin/login') {
      setCurrentPage('admin-login');
    } else if (path.startsWith('/product/')) {
      const slug = path.replace('/product/', '');
      setProductSlug(slug);
      setCurrentPage('product');
    } else if (path.startsWith('/order/')) {
      const orderNum = path.replace('/order/', '');
      setOrderNumber(orderNum);
      setCurrentPage('order-confirmation');
    }
  };

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
    let newPath = '/';

    switch (page) {
      case 'home':
        newPath = '/';
        break;
      case 'catalogue':
        newPath = '/catalogue';
        break;
      case 'stacks':
        newPath = '/stacks';
        break;
      case 'shop':
        newPath = '/shop';
        break;
      case 'cart':
        newPath = '/cart';
        break;
      case 'checkout':
        newPath = '/checkout';
        break;
      case 'about':
        newPath = '/about';
        break;
      case 'shipping':
        newPath = '/shipping';
        break;
      case 'legal':
        newPath = '/legal';
        break;
      case 'admin':
        newPath = '/admin';
        break;
      case 'admin-login':
        newPath = '/admin/login';
        break;
      case 'product':
        newPath = `/product/${param}`;
        setProductSlug(param || '');
        break;
      case 'order-confirmation':
        newPath = `/order/${param}`;
        setOrderNumber(param || '');
        break;
      case 'payment-success':
        newPath = window.location.pathname;
        break;
      default:
        newPath = '/';
    }

    if (newPath !== window.location.pathname) {
      window.history.pushState({}, '', newPath);
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCartUpdate = () => {
    fetchCartCount();
  };


  return (
    <ErrorBoundary onNavigate={handleNavigate}>
      <div className="min-h-screen bg-[#050608]">
        {currentPage !== 'admin' && currentPage !== 'admin-login' && (
          <Navigation currentPage={currentPage} onNavigate={handleNavigate} cartCount={cartCount} />
        )}

        <ErrorBoundary onNavigate={handleNavigate}>
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
        </ErrorBoundary>

        {currentPage !== 'admin' && currentPage !== 'admin-login' && <Footer onNavigate={handleNavigate} />}
        {currentPage !== 'admin' && currentPage !== 'admin-login' && (
          <MobileBottomNav
            currentPage={currentPage}
            onNavigate={handleNavigate}
            cartCount={cartCount}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
