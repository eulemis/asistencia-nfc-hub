import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Persona } from '@/types';
import { User, UserCheck, Nfc } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onVincularNfc: (personaId: number) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onVincularNfc }) => {
  const getSexoIcon = () => {
    if (persona.sexo === 'masculino') {
      return <User className="w-4 h-4 text-blue-500" />;
    }
    return <User className="w-4 h-4 text-pink-500" />;
  };

  const getBorderColor = () => {
    if (persona.sexo === 'masculino') {
      return 'border-l-blue-500';
    }
    return 'border-l-pink-500';
  };

  const getInitials = () => {
    return `${persona.nombre.charAt(0)}${persona.apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className={`border-l-4 ${getBorderColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar/Foto */}
          <Avatar className="w-12 h-12">
            <AvatarImage src={persona.foto || undefined} alt={`${persona.nombre} ${persona.apellido}`} />
            <AvatarFallback className="text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSexoIcon()}
              <h3 className="font-semibold">
                {persona.nombre} {persona.apellido}
              </h3>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Edad: {persona.edad} años</p>
              {persona.telefono && <p>Teléfono: {persona.telefono}</p>}
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              {persona.nfc_uid ? (
                <div className="flex items-center gap-1 text-green-600">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-xs">Vinculado ✅</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVincularNfc(persona.id)}
                  className="flex items-center gap-1"
                >
                  <Nfc className="w-4 h-4" />
                  Vincular NFC
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaCard; 