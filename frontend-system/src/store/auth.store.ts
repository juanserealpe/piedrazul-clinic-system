import { create } from "zustand";

interface User {
  id: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

function decodeJwtPayload(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

const APP_ROLES = ["ADMIN", "DOCTOR", "PATIENT", "SCHEDULER"];

export const useAuthStore = create<AuthState>((set) => ({
  user:         null,
  accessToken:  null,
  refreshToken: null,

  hydrateFromStorage: () => {
    const token        = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!token) return;
    const decoded = decodeJwtPayload(token);
    if (!decoded) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return;
    }
    const rawRoles: string[] = decoded.realm_access?.roles ?? decoded.roles ?? [];
    const roles = rawRoles.filter(r => APP_ROLES.includes(r));
    const id    = decoded.preferred_username ?? decoded.sub ?? "";
    set({ user: { id, roles }, accessToken: token, refreshToken: refreshToken ?? "" });
  },

  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem("accessToken",  accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));