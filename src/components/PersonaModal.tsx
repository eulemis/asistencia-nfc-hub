import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Persona } from '@/types';
import { Circle, CheckCircle, XCircle } from 'lucide-react';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  showActions?: boolean;
}

const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  persona,
  onConfirm,
  onCancel,
  title = "Confirmar Acción",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showActions = true
}) => {
  if (!persona) return null;

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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la persona */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Avatar */}
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={persona.foto} 
                alt={`${persona.nombre} ${persona.apellido}`}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(persona.nombre, persona.apellido)}
              </AvatarFallback>
            </Avatar>

            {/* Información */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">
                  {persona.nombre} {persona.apellido}
                </h3>
                {getSexoIcon(persona.sexo)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getTipoColor(persona.tipo)}>
                    {persona.tipo}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {persona.edad} años
                  </span>
                </div>

                {persona.cedula && (
                  <p className="text-sm text-muted-foreground">
                    CI: {persona.cedula}
                  </p>
                )}

                {persona.telefono && (
                  <p className="text-sm text-muted-foreground">
                    Tel: {persona.telefono}
                  </p>
                )}

                {persona.email && (
                  <p className="text-sm text-muted-foreground">
                    {persona.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          {showActions && (
            <div className="flex gap-2">
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {cancelText}
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {confirmText}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaModal; 