import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FiltroEdad } from '@/types';

interface FiltroEdadSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const FiltroEdadSelector: React.FC<FiltroEdadSelectorProps> = ({ value, onValueChange }) => {
  const rangosEdad: FiltroEdad[] = [
    { label: '8 a 9 años', edad_min: 8, edad_max: 9 },
    { label: '10 a 11 años', edad_min: 10, edad_max: 11 },
    { label: '12 a 13 años', edad_min: 12, edad_max: 13 },
    { label: '14 a 17 años', edad_min: 14, edad_max: 17 },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Filtrar por edad" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todas las edades</SelectItem>
        {rangosEdad.map((rango) => (
          <SelectItem key={rango.edad_min} value={`${rango.edad_min}-${rango.edad_max}`}>
            {rango.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FiltroEdadSelector; 