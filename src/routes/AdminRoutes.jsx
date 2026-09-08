import { memo, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/admin/layout/AdminLayout";

// Lazy load admin pages for better performance
const Dashboard = lazy(() => import("../Pages/admin/Dashboard"));
const Posts = lazy(() => import("../Pages/admin/Posts"));
const Jackpots = lazy(() => import("../Pages/admin/Jackpot"));
const AdminCategories = lazy(() => import("../Pages/admin/Categories"));
const Users = lazy(() => import("../Pages/admin/Users"));
const SEO = lazy(() => import("../Pages/admin/SEO"));
const SyncRuns = lazy(() => import("../Pages/admin/SyncRuns"));

// Import post components for nested routes
import PostList from "../components/admin/posts/PostList";
import CreatePost from "../components/admin/posts/CreatePost";
import EditPost from "../components/admin/posts/EditPost";
import AdminPanel from "../Pages/admin/AdsPlacements";
import CategoryInfoPage from "../components/admin/categoresinfo/categoryinfo";
import JackpotList from "../components/admin/jackpot/JackpostList";
import CreateJackpot from "../components/admin/jackpot/createJackpot";
import EditJackpot from "../components/admin/jackpot/EditJackpot";

// Loading component for admin pages
const AdminLoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading admin panel...</p>
    </div>
  </div>
);

const AdminRoutes = memo(() => {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <Routes>
        {/* Admin layout wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - accessible to all authenticated users */}
          <Route
            index
            element={
              <ProtectedRoute requiredPermission="view_analytics">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredPermission="view_analytics">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="categoriesinfo"
            element={
              <ProtectedRoute requiredPermission="canManageCategoriesinfo">
                <AdminCategories />
              </ProtectedRoute>
            }
          >
            {/* <Route index element={<AdminCategoriesPage />} /> */}
            <Route path=":categoryName" element={<CategoryInfoPage />} />

            {/* <Route path="new" element={<AdminCategoriesPage />} /> */}
            <Route
              path="*"
              element={<Navigate to="/admin/categoriesinfo" replace />}
            />
          </Route>

          {/* Posts management - accessible to editors and above */}
          <Route
            path="posts"
            element={
              <ProtectedRoute requiredPermission="manage_posts">
                <Posts />
              </ProtectedRoute>
            }
          >
            <Route index element={<PostList />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="edit/:id" element={<EditPost />} />
            <Route path="*" element={<Navigate to="/admin/posts" replace />} />
          </Route>
          {/* Jackpot management - accessible to editors and above */}
          <Route
            path="Jackpots"
            element={
              <ProtectedRoute requiredPermission="manage_jackpot">
                <Jackpots />
              </ProtectedRoute>
            }
          >
            <Route index element={<JackpotList />} />
            <Route path="create" element={<CreateJackpot />} />
            <Route path="edit/:id" element={<EditJackpot />} />
            <Route
              path="*"
              element={<Navigate to="/admin/Jackpots" replace />}
            />
          </Route>

          {/* User management - accessible to admins and above */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredPermission="manage_users">
                <Users />
              </ProtectedRoute>
            }
          />

          {/* SEO settings - accessible to editors and above */}
          <Route
            path="seo"
            element={
              <ProtectedRoute requiredPermission="manage_seo">
                <SEO />
              </ProtectedRoute>
            }
          />
          <Route
            path="adplacememt"
            element={
              <ProtectedRoute requiredPermission="manage_ad_placement">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Sync Runs - admin/superadmin only */}
          <Route
            path="sync-runs"
            element={
              <ProtectedRoute requiredPermission="manage_sync_runs">
                <SyncRuns />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
});

AdminRoutes.displayName = "AdminRoutes";

export default AdminRoutes;
