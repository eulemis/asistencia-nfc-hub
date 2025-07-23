import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FiltroEdad } from '@/types';

interface FiltroEdadProps {
  filtrosEdad: FiltroEdad[];
  valorSeleccionado: string;
  onCambio: (valor: string) => void;
  placeholder?: string;
  className?: string;
}

const FiltroEdad: React.FC<FiltroEdadProps> = ({
  filtrosEdad,
  valorSeleccionado,
  onCambio,
  placeholder = "Filtrar por edad",
  className = ""
}) => {
  return (
    <Select value={valorSeleccionado} onValueChange={onCambio}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sin-filtro">Todas las edades</SelectItem>
        {filtrosEdad.map((filtro) => (
          <SelectItem key={filtro.label} value={`${filtro.edad_min}-${filtro.edad_max}`}>
            {filtro.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FiltroEdad; 