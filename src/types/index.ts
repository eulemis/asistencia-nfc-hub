export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  tipo: 'niño' | 'joven' | 'adulto';
  telefono?: string;
  email?: string;
  nfc_uid?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asistencia {
  id: number;
  persona_id: number;
  tipo: 'entrada' | 'salida';
  fecha_hora: string;
  dispositivo_uuid: string;
  created_at: string;
  updated_at: string;
  persona: Persona;
}

export interface Device {
  id: number;
  uuid: string;
  name: string;
  type: string;
  activo: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NfcData {
  uid: string;
  persona?: Persona;
  asistencias_hoy: Asistencia[];
}