import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'User', 'Vendor', 'Admin'
  const [token, setToken] = useState(null);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage on mount
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    const storedApproved = localStorage.getItem('isApproved');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setToken(storedToken);
      setIsApproved(storedApproved === 'true');
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole, userToken, approved = true) => {
    setUser(userData);
    setRole(userRole);
    setToken(userToken);
    setIsApproved(approved);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    localStorage.setItem('token', userToken);
    localStorage.setItem('isApproved', approved);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    setIsApproved(true);
    
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('isApproved');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isApproved, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
