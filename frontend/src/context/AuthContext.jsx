import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [allowUser, setAllowUser] = useState(undefined);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAllowUser(true);
      // Set a timeout to remove the token after 15 minutes
      const timeout = setTimeout(() => {
        localStorage.removeItem('authToken');
        setAllowUser(false);
      }, 15 * 60 * 1000); // 15 minutes in milliseconds

      // Clear the timeout if the component unmounts or token changes
      return () => clearTimeout(timeout);
    } else {
      setAllowUser(false);
    }
  }, []);

  const value = {
    allowUser,
    setAllowUser,
    setDisplay,
    display,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};