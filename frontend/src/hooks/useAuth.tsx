import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type AuthResponse, type LoginDto, type RegisterDto } from '../api/authApi';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setToken(savedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthResponse = (res: AuthResponse) => {
    const u: User = { username: res.username, role: res.role };
    setToken(res.token);
    setUser(u);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const login = async (data: LoginDto) => {
    const res = await authApi.login(data);
    handleAuthResponse(res.data);
  };

  const register = async (data: RegisterDto) => {
    const res = await authApi.register(data);
    handleAuthResponse(res.data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
