import axios from 'axios';
import { Device } from '@capacitor/device';

// Configuración base de axios
const api = axios.create({
  baseURL: 'https://centrojuvenildonbosco.org/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let deviceUUID: string | null = null;

// Función para obtener UUID del dispositivo
export const getDeviceUUID = async (): Promise<string> => {
  if (deviceUUID) return deviceUUID;
  
  try {
    const info = await Device.getId();
    deviceUUID = info.identifier;
    return deviceUUID;
  } catch (error) {
    console.error('Error getting device UUID:', error);
    // Fallback para web
    deviceUUID = localStorage.getItem('device-uuid') || crypto.randomUUID();
    localStorage.setItem('device-uuid', deviceUUID);
    return deviceUUID;
  }
};

// Interceptor para añadir token y UUID a todas las requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth-token');
    const uuid = await getDeviceUUID();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (uuid) {
      config.headers['X-Device-UUID'] = uuid;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;