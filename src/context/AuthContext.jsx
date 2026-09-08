import { createContext, useContext, useReducer, useEffect } from "react";
import { apiUrl } from "../utils/apiBase";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

const STORAGE_KEYS = { userData: "userData", userRole: "userRole" };

function clearLocalAuth() {
  try {
    localStorage.removeItem(STORAGE_KEYS.userData);
    localStorage.removeItem(STORAGE_KEYS.userRole);
  } catch {}
}

function persistLocalAuth(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(user));
    if (user?.role) localStorage.setItem(STORAGE_KEYS.userRole, user.role);
  } catch {}
}

async function fetchMe() {
  const res = await fetch(apiUrl("/user/me"), {
    credentials: "include",
  });
  if (res.status === 401) return { ok: false };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success || !data.user) return { ok: false };
  return { ok: true, user: data.user };
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: verify session via /api/user/me (HttpOnly cookie auth).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchMe();
        if (cancelled) return;
        if (result.ok) {
          persistLocalAuth(result.user);
          dispatch({ type: "LOGIN_SUCCESS", payload: result.user });
        } else {
          clearLocalAuth();
          dispatch({ type: "LOGOUT" });
        }
      } catch (err) {
        if (cancelled) return;
        clearLocalAuth();
        dispatch({ type: "LOGOUT" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const checkSession = async () => {
    try {
      const result = await fetchMe();
      if (result.ok) {
        persistLocalAuth(result.user);
        dispatch({ type: "LOGIN_SUCCESS", payload: result.user });
      } else {
        clearLocalAuth();
        dispatch({ type: "LOGOUT" });
      }
      return result.ok;
    } catch {
      clearLocalAuth();
      dispatch({ type: "LOGOUT" });
      return false;
    }
  };

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await fetch(apiUrl("/user/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user = data.user;
      persistLocalAuth(user);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(apiUrl("/user/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // Fire-and-forget: clear local state regardless.
      console.warn("Backend logout failed (continuing with local logout):", err);
    }
    clearLocalAuth();
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const updateUser = (updatedUserData) => {
    const currentUserData = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.userData) || "{}"
    );
    const newUserData = { ...currentUserData, ...updatedUserData };
    persistLocalAuth(newUserData);
    dispatch({ type: "UPDATE_USER", payload: updatedUserData });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    updateUser,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};