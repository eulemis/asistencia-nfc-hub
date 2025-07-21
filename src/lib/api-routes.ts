export const API_ROUTES = {
  // Rutas de autenticación
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    ME: '/me',
    LOGOUT: '/logout',
  },
  
  // Rutas para gestión de dispositivos
  DEVICES: {
    REGISTER: '/devices/register',
    LIST: '/devices',
    DEACTIVATE: (id: number) => `/devices/${id}/deactivate`,
  },
  
  // Rutas protegidas (requieren auth + dispositivo autorizado)
  PERSONAS: {
    LIST: '/personas',
    ASOCIAR_NFC: (id: number) => `/personas/${id}/asociar-nfc`,
  },
  
  NFC: {
    GET_DATA: (uid: string) => `/nfc/${uid}`,
  },
  
  ASISTENCIAS: {
    STORE: '/asistencias',
  },
} as const;