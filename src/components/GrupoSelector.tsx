import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Grupo } from '@/types';

interface GrupoSelectorProps {
  grupos: Grupo[];
  valorSeleccionado: string;
  onCambio: (valor: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const GrupoSelector: React.FC<GrupoSelectorProps> = ({
  grupos,
  valorSeleccionado,
  onCambio,
  placeholder = "Seleccionar grupo",
  className = "",
  isLoading = false
}) => {
  return (
    <Select value={valorSeleccionado} onValueChange={onCambio} disabled={isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Cargando grupos..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sin-filtro">Todos los grupos</SelectItem>
        {grupos.map((grupo) => (
          <SelectItem key={grupo.id} value={grupo.id.toString()}>
            {grupo.nombre} ({grupo.personas_count} personas)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default GrupoSelector; 