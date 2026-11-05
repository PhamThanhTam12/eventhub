import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { AUTH_STORAGE_KEY, authenticateDemo, getDemoUserById } from "../utils/auth";

function getInitialUser() {
  try {
    return getDemoUserById(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(AUTH_STORAGE_KEY, user.id);
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // In-memory login still works when browser storage is unavailable.
    }
  }, [user]);

  function login(email, password) {
    const sessionUser = authenticateDemo(email, password);
    setUser(sessionUser);
    return sessionUser;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
