import { createContext, useContext, useEffect, useState } from "react";
const SessionContext = createContext();
export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include", // send cookies
        });

        const data = await res.json();
        setSession(data.user);
      } catch (err) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    setSession(null);
  };

  return (
    <SessionContext.Provider value={{ session, loading, setSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
};