import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Persona } from '@/types';
import { User, Circle, CheckCircle, Clock, XCircle } from 'lucide-react';

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

  const formatearHora = (hora: string | undefined | null) => {
    if (!hora) return 'N/A';
    try {
      // Si la hora ya está en formato h:mm A (12 horas), la devolvemos tal como está
      if (/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/.test(hora)) {
        return hora;
      }
      // Si la hora está en formato HH:mm (24 horas), la convertimos a 12 horas
      if (/^\d{2}:\d{2}$/.test(hora)) {
        const [horas, minutos] = hora.split(':');
        const horaNum = parseInt(horas);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum === 0 ? 12 : (horaNum > 12 ? horaNum - 12 : horaNum);
        return `${hora12.toString().padStart(2, '0')}:${minutos} ${ampm}`;
      }
      // Si es una fecha completa, extraemos solo la hora en formato 12 horas
      const fecha = new Date(hora);
      if (isNaN(fecha.getTime())) return 'N/A';
      return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando hora:', error);
      return 'N/A';
    }
  };

  // Obtener información de asistencia
  const asistencia = persona.asistencia;
  const getAsistenciaIcon = () => {
    if (!asistencia) return <XCircle className="w-4 h-4 text-red-600" />;
    
    if (asistencia.completa) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (asistencia.tiene_entrada) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getAsistenciaText = () => {
    if (!asistencia) return 'Sin asistencia';
    if (asistencia.completa) return `Entrada: ${formatearHora(asistencia.hora_entrada)} - Salida: ${formatearHora(asistencia.hora_salida)}`;
    if (asistencia.tiene_entrada) return `Entrada: ${formatearHora(asistencia.hora_entrada)}`;
    return 'Sin asistencia';
  };

  const getAsistenciaColor = () => {
    if (!asistencia) return 'bg-red-100 text-red-800';
    if (asistencia.completa) return 'bg-green-100 text-green-800';
    if (asistencia.tiene_entrada) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
              {getAsistenciaIcon()}
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
                <Badge className={getAsistenciaColor()}>
                  {getAsistenciaText()}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaCardAsistencia; 