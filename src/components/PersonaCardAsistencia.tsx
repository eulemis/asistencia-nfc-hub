import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Persona } from '@/types';
import { User, Circle } from 'lucide-react';

interface PersonaCardAsistenciaProps {
  persona: Persona;
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

const PersonaCardAsistencia: React.FC<PersonaCardAsistenciaProps> = ({ 
  persona, 
  showDetails = true, 
  className = "", 
  onClick 
}) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'niño': return 'bg-blue-100 text-blue-800';
      case 'joven': return 'bg-green-100 text-green-800';
      case 'adulto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSexoIcon = (sexo: string) => {
    return sexo === 'masculino' ? (
      <Circle className="w-4 h-4 text-blue-600" />
    ) : (
      <Circle className="w-4 h-4 text-pink-600" />
    );
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={persona.foto} 
              alt={`${persona.nombre} ${persona.apellido}`}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(persona.nombre, persona.apellido)}
            </AvatarFallback>
          </Avatar>

          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {persona.nombre} {persona.apellido}
              </h3>
              {getSexoIcon(persona.sexo)}
            </div>

            {showDetails && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTipoColor(persona.tipo)}>
                  {persona.tipo}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {persona.edad} años
                </span>
                {persona.cedula && (
                  <span className="text-sm text-muted-foreground">
                    CI: {persona.cedula}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaCardAsistencia; 