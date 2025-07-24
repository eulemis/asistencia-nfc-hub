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
    
    console.log('Request interceptor - Token:', token ? 'Present' : 'Missing');
    console.log('Request interceptor - UUID:', uuid);
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    }
    
    if (uuid) {
      config.headers['X-Device-UUID'] = uuid;
      console.log('X-Device-UUID header set:', uuid);
    }
    
    console.log('Final headers:', config.headers);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      localStorage.removeItem('device-id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;