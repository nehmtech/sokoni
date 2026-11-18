import { createContext, useContext, useEffect, useState } from "react";
import {
  clearCredentials,
  getMe,
  hasCredentials,
  loginUser,
  registerUser,
  setToken,
} from "../api";

// Context = a way to share data (who is logged in) with every component
// without passing props down through every level.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // false until we know if someone is logged in

  // On first load, if we have saved credentials, find out who they belong to.
  useEffect(() => {
    if (!hasCredentials()) {
      setReady(true);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => clearCredentials())
      .finally(() => setReady(true));
  }, []);

  async function login(username, password) {
    clearCredentials(); // never send an old token to the login endpoint
    try {
      const { token } = await loginUser(username, password); // 1. exchange password for a token
      setToken(token);                                       // 2. remember it
      const me = await getMe();                              // 3. load the user's profile
      setUser(me);
      return me;
    } catch (err) {
      clearCredentials();
      if (err.status === 400) {
        throw new Error("Wrong username or password.");
      }
      throw err;
    }
  }

  async function register(form) {
    await registerUser(form);
    return login(form.username, form.password);
  }

  function logout() {
    clearCredentials();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
