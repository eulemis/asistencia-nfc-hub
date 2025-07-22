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
  tipo: 'hijo' | 'animador' | 'adulto';
  sexo: 'masculino' | 'femenino';
  cedula?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  nfc_uid?: string;
  foto?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad_maxima?: number;
  edad_minima?: number;
  edad_maxima?: number;
  personas_count: number;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T[];
  pagination: PaginationInfo;
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

export interface FiltroEdad {
  label: string;
  edad_min: number;
  edad_max: number;
}

export interface FiltroTipoPersona {
  label: string;
  value: string;
}