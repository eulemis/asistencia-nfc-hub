import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { getDeviceUUID } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  deviceUUID: string | null;
  deviceId: number | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  registerDevice: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth-token'));
  const [deviceUUID, setDeviceUUID] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<number | null>(() => {
    const stored = localStorage.getItem('device-id');
    return stored ? parseInt(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Inicializar UUID del dispositivo
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const uuid = await getDeviceUUID();
        setDeviceUUID(uuid);
      } catch (error) {
        console.error('Error initializing device UUID:', error);
      }
    };
    initializeDevice();
  }, []);

  // Verificar autenticación al iniciar
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Configurar headers con el UUID del dispositivo
      const headers = {};
      if (deviceUUID) {
        headers['X-Device-UUID'] = deviceUUID;
        console.log('Sending device UUID:', deviceUUID);
      } else {
        console.log('No device UUID available');
      }
      
      const response = await api.post('/login', { 
        email, 
        password,
        device_name: 'Mobile App'
      }, { headers });
      
      const { token: authToken, user: userData, device_id, device_name } = response.data;
      
      localStorage.setItem('auth-token', authToken);
      localStorage.setItem('user-data', JSON.stringify(userData));
      localStorage.setItem('device-id', device_id?.toString() || '');
      
      setToken(authToken);
      setUser(userData);
      setDeviceId(device_id);
      
      console.log('Login successful - Device ID:', device_id);
      
      toast({
        title: "Login exitoso",
        description: "Has iniciado sesión correctamente",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      console.log('Login error:', error.response?.data);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem('auth-token', authToken);
      localStorage.setItem('user-data', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      localStorage.removeItem('device-id');
      setToken(null);
      setUser(null);
      setDeviceId(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await api.get('/me');
      setUser(response.data);
      
      // Verificar si hay datos de usuario en localStorage
      const storedUser = localStorage.getItem('user-data');
      if (!storedUser) {
        localStorage.setItem('user-data', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (): Promise<void> => {
    try {
      if (!deviceUUID) return;
      
      await api.post('/devices/register', {
        uuid: deviceUUID,
        name: 'Dispositivo Móvil',
        type: 'mobile',
      });
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    deviceUUID,
    deviceId,
    loading,
    login,
    register,
    logout,
    checkAuth,
    registerDevice,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};