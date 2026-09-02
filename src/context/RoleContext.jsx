import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

const RoleContext = createContext();

// Role hierarchy and permissions
const ROLE_PERMISSIONS = {
  superadmin: {
    level: 4,
    permissions: [
      "manage_users",
      "manage_jackpot",
      "manage_posts",
      "manage_seo",
      "manage_site_settings",
      "canManageCategoriesinfo",
      "manage_admins",
      "view_analytics",
      "manage_ad_placement",
      "manage_sync_runs",
    ],
  },
  admin: {
    level: 3,
    permissions: [
      "manage_users",
      "manage_jackpot",
      "canManageCategoriesinfo",
      "manage_posts",
      "manage_seo",
      "manage_site_settings",
      "view_analytics",
      "manage_ad_placement",
      "manage_sync_runs",
    ],
  },
  editor: {
    level: 2,
    permissions: [
      "manage_posts",
      "manage_jackpot",
      "manage_seo",
      "canManageCategoriesinfo",
      "manage_ad_placement",
      "view_analytics",
    ],
  },
  subscriber: {
    level: 1,
    permissions: ["view_posts"],
  },
};

export const RoleProvider = ({ children }) => {
  const { user, loading } = useAuth();

  const roleInfo = useMemo(() => {
    if (loading || !user) {
      return {
        role: null,
        level: 0,
        permissions: [],
        canAccess: () => false,
        hasPermission: () => false,
      };
    }

    const userRole = user.role || "subscriber";
    const roleData = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.subscriber;

    return {
      role: userRole,
      level: roleData.level,
      permissions: roleData.permissions,
      canAccess: (requiredRole) => {
        const requiredLevel = ROLE_PERMISSIONS[requiredRole]?.level || 0;
        return roleData.level >= requiredLevel;
      },
      hasPermission: (permission) => {
        return roleData.permissions.includes(permission);
      },
    };
  }, [user, loading]);

  const value = {
    ...roleInfo,
    isSuperAdmin: roleInfo.role === "superadmin",
    isAdmin: roleInfo.role === "admin" || roleInfo.role === "superadmin",
    isEditor:
      roleInfo.role === "editor" ||
      roleInfo.role === "admin" ||
      roleInfo.role === "superadmin",
    canManageUsers: roleInfo.hasPermission("manage_users"),
    canManageJackpots: roleInfo.hasPermission("manage_jackpot"),
    canManagePosts: roleInfo.hasPermission("manage_posts"),
    canManageSEO: roleInfo.hasPermission("manage_seo"),
    canManageSiteSettings: roleInfo.hasPermission("manage_site_settings"),
    canViewAnalytics: roleInfo.hasPermission("view_analytics"),
    canManageCategoriesinfo: roleInfo.hasPermission("canManageCategoriesinfo"),
    canManageAdPlacement: roleInfo.hasPermission("manage_ad_placement"),
    canManageAdmins: roleInfo.hasPermission("manage_admins"),
    canManageSyncRuns: roleInfo.hasPermission("manage_sync_runs"),
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
