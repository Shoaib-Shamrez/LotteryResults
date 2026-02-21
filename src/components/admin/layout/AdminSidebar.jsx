import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useRole } from "../../../context/RoleContext";

const AdminSidebar = memo(() => {
  const location = useLocation();
  const {
    canManageUsers,
    canManageCategoriesinfo,
    canManagePosts,
    canManageSEO,
    canManageSiteSettings,
    canViewAnalytics,
    canManageAdPlacement,
    canManageAdmins,
  } = useRole();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "📈",
      permission: "view_analytics",
    },
    {
      name: "Categores Info Pages",
      path: "/admin/categoriesinfo",
      icon: "📊",
      permission: "canManageCategoriesinfo",
    },
    {
      name: "Posts",
      path: "/admin/posts",
      icon: "📝",
      permission: "manage_posts",
    },
    {
      name: "JackPots",
      path: "/admin/JackPots",
      icon: "🚀",
      permission: "manage_jackpots",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: "👥",
      permission: "manage_users",
    },
    {
      name: "Ad Placement",
      path: "/admin/adplacememt",
      icon: "🔥",
      permission: "manage_ad_placement",
    },
    {
      name: "SEO Settings",
      path: "/admin/seo",
      icon: "🔍",
      permission: "manage_seo",
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    switch (item.permission) {
      case "view_analytics":
        return canViewAnalytics;
      case "manage_posts":
        return canManagePosts;
      case "manage_users":
        return canManageUsers;
      case "canMageCategoriesinfo":
        return canManageCategoriesinfo;
      case "manage_ad_placement":
        return canManageAdPlacement;
      case "manage_seo":
        return canManageSEO;
      case "manage_site_settings":
        return canManageSiteSettings;
      default:
        return true;
    }
  });

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Lottery Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems?.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          Admin Panel v1.0
        </div>
      </div>
    </div>
  );
});

AdminSidebar.displayName = "AdminSidebar";

export default AdminSidebar;
