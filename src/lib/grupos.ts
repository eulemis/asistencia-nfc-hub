import api from '@/lib/axios';

export interface Grupo {
  id: number;
  nombre: string;
}

export const fetchGrupos = async (): Promise<Grupo[]> => {
  const response = await api.get('/grupos');
  // Ajusta según la estructura real de la respuesta
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
};
