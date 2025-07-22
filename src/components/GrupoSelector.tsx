import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grupo } from '@/types';
import api from '@/lib/axios';

interface GrupoSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const GrupoSelector: React.FC<GrupoSelectorProps> = ({ value, onValueChange }) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Cargando grupos..." : "Filtrar por grupo"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos los grupos</SelectItem>
        {grupos.map((grupo) => (
          <SelectItem key={grupo.id} value={grupo.id.toString()}>
            {grupo.nombre} ({grupo.personas_count})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default GrupoSelector; 