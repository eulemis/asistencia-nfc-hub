import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Persona, Asistencia, Grupo } from '@/types';
import type { FiltroEdad } from '@/types';
import PersonaCardAsistencia from '@/components/PersonaCardAsistencia';
import FiltroEdadComponent from '@/components/FiltroEdad';
import GrupoSelector from '@/components/GrupoSelector';
import NfcScannerAsistencia from '@/components/NfcScannerAsistencia';
import PersonaModal from '@/components/PersonaModal';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Calendar, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

const Asistencias: React.FC = () => {
  // Estados principales
  const [asistencias, setAsistencias] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false);
  
  // Estados de filtros
  const [filtroFecha, setFiltroFecha] = useState<string>(() => {
    // Usar la fecha de ayer por defecto para mostrar datos de prueba
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    return ayer.toISOString().split('T')[0];
  });
  const [filtroEdad, setFiltroEdad] = useState<string>('sin-filtro');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('sin-filtro');
  const [busqueda, setBusqueda] = useState('');
  
  // Estados de NFC
  const [showNfcScanner, setShowNfcScanner] = useState(false);
  const [personaDetectada, setPersonaDetectada] = useState<Persona | null>(null);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  
  // Estados de datos
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  
  const { toast } = useToast();
  const { deviceId } = useAuth();

  // Filtros de edad predefinidos
  const filtrosEdad: FiltroEdad[] = [
    { label: '8 a 9 años', edad_min: 8, edad_max: 9 },
    { label: '10 a 11 años', edad_min: 10, edad_max: 11 },
    { label: '12 a 13 años', edad_min: 12, edad_max: 13 },
    { label: '14 a 17 años', edad_min: 14, edad_max: 17 },
    { label: '18 a 25 años', edad_min: 18, edad_max: 25 },
    { label: '26+ años', edad_min: 26, edad_max: 100 },
  ];

  useEffect(() => {
    cargarAsistencias();
    cargarGrupos();
  }, [filtroFecha, filtroEdad, filtroGrupo, busqueda]);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de filtro
      const params = new URLSearchParams();
      if (filtroFecha) params.append('fecha', filtroFecha);
      if (filtroEdad && filtroEdad !== 'sin-filtro') {
        const filtro = filtrosEdad.find(f => f.label === filtroEdad);
        if (filtro) {
          params.append('edad_min', filtro.edad_min.toString());
          params.append('edad_max', filtro.edad_max.toString());
        }
      }
      if (filtroGrupo && filtroGrupo !== 'sin-filtro') {
        params.append('grupo_id', filtroGrupo);
      }
      if (busqueda) params.append('busqueda', busqueda);

      // Usar la nueva ruta para obtener asistencias
      const response = await api.get(`/asistencias?${params.toString()}&tipo=hijo`);
      
      // Validar y extraer datos de la respuesta
      let asistenciasData: Persona[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          asistenciasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          asistenciasData = response.data.data;
        } else if (response.data.asistencias && Array.isArray(response.data.asistencias)) {
          asistenciasData = response.data.asistencias;
        }
      }
      
      console.log('Asistencias cargadas:', asistenciasData);
      setAsistencias(asistenciasData);
    } catch (error) {
      console.error('Error cargando asistencias:', error);
      setAsistencias([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar las asistencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarGrupos = async () => {
    try {
      setLoadingGrupos(true);
      const response = await api.get('/grupos');
      
      // Validar y extraer datos de la respuesta
      let gruposData: Grupo[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          gruposData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          gruposData = response.data.data;
        } else if (response.data.grupos && Array.isArray(response.data.grupos)) {
          gruposData = response.data.grupos;
        }
      }
      
      console.log('Grupos cargados:', gruposData);
      setGrupos(gruposData);
    } catch (error) {
      console.error('Error cargando grupos:', error);
      setGrupos([]);
    } finally {
      setLoadingGrupos(false);
    }
  };

  const handleNfcScanSuccess = async (uid: string) => {
    try {
      // Encriptar el UID para mayor seguridad
      const encryptedUid = btoa(uid); // Base64 encoding
      
      // Usar la ruta GET existente con UID encriptado
      const response = await api.get(`/persona-por-nfc/${encryptedUid}`);
      
      // La API devuelve los datos directamente, no dentro de un objeto persona
      if (response.data && response.data.id) {
        setPersonaDetectada(response.data);
        setShowPersonaModal(true);
      } else {
        toast({
          title: "Tarjeta no asociada",
          description: "Esta tarjeta NFC no está asociada a ninguna persona",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error consultando persona por NFC:', error);
      const message = error.response?.data?.message || 'Error al consultar tarjeta NFC';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleConfirmarAsistencia = async () => {
    if (!personaDetectada) return;
    
    if (!deviceId) {
      toast({
        title: "Error",
        description: "No se pudo identificar el dispositivo. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegistrandoAsistencia(true);
      
      // Formato de fecha compatible con MySQL
      const now = new Date();
      const fechaHora = now.toISOString().slice(0, 19).replace('T', ' ');
      
      const asistenciaData = {
        persona_id: personaDetectada.id,
        dispositivo_id: deviceId,
        fecha_hora: fechaHora,
        ubicacion: 'Centro Juvenil Don Bosco'
      };
      
      console.log('Registrando asistencia con datos:', asistenciaData);
      
      const response = await api.post('/asistencias', asistenciaData);
      
      // Obtener el tipo determinado por el backend
      const tipoDeterminado = response.data.tipo_determinado || 'entrada';

      toast({
        title: "Asistencia registrada",
        description: `${tipoDeterminado.charAt(0).toUpperCase() + tipoDeterminado.slice(1)} registrada para ${personaDetectada.nombre} ${personaDetectada.apellido}`,
      });

      // Recargar asistencias y limpiar estado
      await cargarAsistencias();
      setPersonaDetectada(null);
      setShowPersonaModal(false);
      setShowNfcScanner(false);
    } catch (error: any) {
      console.error('Error registrando asistencia:', error);
      const message = error.response?.data?.message || 'Error al registrar asistencia';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setRegistrandoAsistencia(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getAsistenciaColor = (tipo: string) => {
    switch (tipo) {
      case 'completa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'entrada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sin_asistencia':
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const asistenciasFiltradas = asistencias.filter(persona => {
    // Validar que la persona exista
    if (!persona) {
      return false;
    }
    
    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      const nombreCompleto = `${persona.nombre || ''} ${persona.apellido || ''}`.toLowerCase();
      const cedula = persona.cedula?.toLowerCase() || '';
      
      if (!nombreCompleto.includes(searchTerm) && !cedula.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agregar Asistencia</h1>
            <p className="text-muted-foreground">Registra entradas y salidas con NFC</p>
          </div>
          <Button 
            onClick={() => setShowNfcScanner(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Escanear NFC
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro de fecha */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>

              {/* Filtro de edad */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rango de edad</label>
                <FiltroEdadComponent
                  filtrosEdad={filtrosEdad}
                  valorSeleccionado={filtroEdad}
                  onCambio={setFiltroEdad}
                  placeholder="Filtrar por edad"
                />
              </div>

              {/* Filtro de grupo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupo</label>
                <GrupoSelector
                  grupos={grupos}
                  valorSeleccionado={filtroGrupo}
                  onCambio={setFiltroGrupo}
                  placeholder="Filtrar por grupo"
                  isLoading={loadingGrupos}
                />
              </div>

              {/* Búsqueda */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre, apellido, cédula..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de asistencias */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Asistencias del día
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={cargarAsistencias}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : asistenciasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay asistencias registradas para el {formatearFecha(filtroFecha)}</p>
                <p className="text-sm mt-2">Usa el escáner NFC para registrar asistencias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {asistenciasFiltradas.map((persona) => {
                  // Validar que la persona exista
                  if (!persona) {
                    return null;
                  }
                  
                  // Obtener información de asistencia
                  const asistencia = persona.asistencia;
                  if (!asistencia) {
                    return null;
                  }
                  
                  // Determinar el estado de asistencia
                  const tieneEntrada = asistencia.tiene_entrada;
                  const tieneSalida = asistencia.tiene_salida;
                  const estadoAsistencia = tieneEntrada && tieneSalida ? 'completa' : 
                                         tieneEntrada ? 'entrada' : 'sin_asistencia';
                  
                  return (
                    <div 
                      key={persona.id}
                      className={`p-4 rounded-lg border ${getAsistenciaColor(estadoAsistencia)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {estadoAsistencia === 'completa' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : estadoAsistencia === 'entrada' ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <h4 className="font-semibold">
                              {persona.nombre || ''} {persona.apellido || ''}
                            </h4>
                            <p className="text-sm opacity-75">
                              {estadoAsistencia === 'completa' ? 
                                `Entrada: ${formatearHora(asistencia.hora_entrada)} - Salida: ${formatearHora(asistencia.hora_salida)}` :
                               estadoAsistencia === 'entrada' ? 
                                `Entrada: ${formatearHora(asistencia.hora_entrada)}` :
                               'Sin asistencia registrada'} - {asistencia.fecha}
                            </p>
                          </div>
                        </div>
                        <Badge className={getAsistenciaColor(estadoAsistencia)}>
                          {estadoAsistencia === 'completa' ? 'Completa' :
                           estadoAsistencia === 'entrada' ? 'Entrada' : 'Sin asistencia'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de escáner NFC */}
        {showNfcScanner && (
          <Card className="fixed inset-4 z-50 bg-background border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Escanear Tarjeta NFC</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNfcScanner(false)}
                >
                  Cerrar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NfcScannerAsistencia
                onScanSuccess={handleNfcScanSuccess}
                onScanError={(error) => {
                  toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                  });
                }}
                buttonText="Escanear Tarjeta NFC"
                disabled={registrandoAsistencia}
              />
            </CardContent>
          </Card>
        )}

        {/* Modal de confirmación de persona */}
        <PersonaModal
          isOpen={showPersonaModal}
          onClose={() => {
            setShowPersonaModal(false);
            setPersonaDetectada(null);
          }}
          persona={personaDetectada}
          onConfirm={() => handleConfirmarAsistencia()}
          title="Confirmar Asistencia"
          confirmText="Registrar Asistencia"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
};

export default Asistencias; 