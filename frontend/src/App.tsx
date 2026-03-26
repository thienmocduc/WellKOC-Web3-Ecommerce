import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';

/* ── Lazy-loaded pages ── */
const Home = lazy(() => import('@pages/Home'));
const Marketplace = lazy(() => import('@pages/Marketplace'));
const Promo = lazy(() => import('@pages/Promo'));
const Live = lazy(() => import('@pages/Live'));
const Feed = lazy(() => import('@pages/Feed'));
const Hot = lazy(() => import('@pages/Hot'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Academy = lazy(() => import('@pages/Academy'));
const DPP = lazy(() => import('@pages/DPP'));
const Agents = lazy(() => import('@pages/Agents'));
const Gamification = lazy(() => import('@pages/Gamification'));
const KOC = lazy(() => import('@pages/KOC'));
const Vendor = lazy(() => import('@pages/Vendor'));
const Admin = lazy(() => import('@pages/Admin'));
const Login = lazy(() => import('@pages/Login'));
const Register = lazy(() => import('@pages/Register'));
const Cart = lazy(() => import('@pages/Cart'));
const Checkout = lazy(() => import('@pages/Checkout'));
const ProductDetail = lazy(() => import('@pages/ProductDetail'));
const Pricing = lazy(() => import('@pages/Pricing'));
const NotFound = lazy(() => import('@pages/NotFound'));

/* ── Loading fallback ── */
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-3)',
        fontSize: '0.9rem',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--c6-500)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth pages — outside MainLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All other pages — inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/promo" element={<Promo />} />
          <Route path="/live" element={<Live />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/hot" element={<Hot />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/dpp" element={<DPP />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/koc" element={<KOC />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
