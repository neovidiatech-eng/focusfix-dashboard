import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { AdminLayout } from './shared/components/layout/AdminLayout';
import { LoginPage } from './features/auth/LoginPage';
import { OverviewPage } from './features/overview/OverviewPage';
import { BookingsPage } from './features/bookings/BookingsPage';
import { PricingMatrixPage } from './features/pricing/PricingMatrixPage';
import { CatalogPage } from './features/catalog/CatalogPage';
import { AreasSlotsPage } from './features/areas/AreasSlotsPage';
import { ArticlesListPage } from './features/blog/pages/ArticlesListPage';
import { ArticleEditorPage } from './features/blog/pages/ArticleEditorPage';
import { CategoriesManagerPage } from './features/blog/pages/CategoriesManagerPage';
import { TagsManagerPage } from './features/blog/pages/TagsManagerPage';
import { AuthorsManagerPage } from './features/blog/pages/AuthorsManagerPage';
import { MessagesPage } from './features/messages/MessagesPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AuditLogPage } from './features/audit/AuditLogPage';

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
      <Router>
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
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
