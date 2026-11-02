import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { ToastProvider } from './shared/components/ui/Toast';
import { AdminLayout } from './shared/components/layout/AdminLayout';
import { LoginPage } from './features/auth/LoginPage';

// Each page loads on demand so the dashboard opens faster
const OverviewPage = lazy(() => import('./features/overview/OverviewPage').then((m) => ({ default: m.OverviewPage })));
const BookingsPage = lazy(() => import('./features/bookings/BookingsPage').then((m) => ({ default: m.BookingsPage })));
const PricingMatrixPage = lazy(() => import('./features/pricing/PricingMatrixPage').then((m) => ({ default: m.PricingMatrixPage })));
const CatalogPage = lazy(() => import('./features/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const AreasSlotsPage = lazy(() => import('./features/areas/AreasSlotsPage').then((m) => ({ default: m.AreasSlotsPage })));
const ArticlesListPage = lazy(() => import('./features/blog/pages/ArticlesListPage').then((m) => ({ default: m.ArticlesListPage })));
const ArticleEditorPage = lazy(() => import('./features/blog/pages/ArticleEditorPage').then((m) => ({ default: m.ArticleEditorPage })));
const CategoriesManagerPage = lazy(() => import('./features/blog/pages/CategoriesManagerPage').then((m) => ({ default: m.CategoriesManagerPage })));
const TagsManagerPage = lazy(() => import('./features/blog/pages/TagsManagerPage').then((m) => ({ default: m.TagsManagerPage })));
const AuthorsManagerPage = lazy(() => import('./features/blog/pages/AuthorsManagerPage').then((m) => ({ default: m.AuthorsManagerPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AuditLogPage = lazy(() => import('./features/audit/AuditLogPage').then((m) => ({ default: m.AuditLogPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">جاري التحميل…</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="pricing" element={<PricingMatrixPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="areas" element={<AreasSlotsPage />} />
            <Route path="blog" element={<ArticlesListPage />} />
            <Route path="blog/new" element={<ArticleEditorPage />} />
            <Route path="blog/edit/:id" element={<ArticleEditorPage />} />
            <Route path="blog/categories" element={<CategoriesManagerPage />} />
            <Route path="blog/tags" element={<TagsManagerPage />} />
            <Route path="blog/authors" element={<AuthorsManagerPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
        </Suspense>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
