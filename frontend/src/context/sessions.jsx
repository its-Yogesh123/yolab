import { createContext, useContext, useEffect, useState } from "react";
const SessionContext = createContext();
export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session...");
      try {
        const res = await fetch("http://localhost:8000/auth/session", {
          method: "GET",
          credentials: "include", // send cookies
        });

        const data = await res.json();
        const status = res.status;
        console.log("data",data);
        console.log("status",status);
        setSession(data.user);  
      } catch (err) {
        console.log("Error checking session:",err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    const res =await fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    const status = res.status;
    if(status === 200){
      alert("Logout Success");
      setSession(null);
    } else{
      alert("Logout Failed");
    }
  };

  return (
    <SessionContext.Provider value={{ session, loading, setSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
};