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
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false);
  
  // Estados de filtros
  const [filtroFecha, setFiltroFecha] = useState<string>(new Date().toISOString().split('T')[0]);
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

      const response = await api.get(`/asistencias?${params.toString()}`);
      
      // Validar y extraer datos de la respuesta
      let asistenciasData: Asistencia[] = [];
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
      // Consultar persona por UID NFC
      const response = await api.get(`/persona-por-nfc/${uid}`);
      
      if (response.data.persona) {
        setPersonaDetectada(response.data.persona);
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

  const handleConfirmarAsistencia = async (tipo: 'entrada' | 'salida') => {
    if (!personaDetectada) return;

    try {
      setRegistrandoAsistencia(true);
      
      await api.post('/asistencias', {
        persona_id: personaDetectada.id,
        tipo: tipo,
        nfc_uid: personaDetectada.nfc_uid
      });

      toast({
        title: "Asistencia registrada",
        description: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada para ${personaDetectada.nombre} ${personaDetectada.apellido}`,
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

  const getAsistenciaColor = (tipo: string) => {
    return tipo === 'entrada' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const asistenciasFiltradas = asistencias.filter(asistencia => {
    // Validar que la asistencia y persona existan
    if (!asistencia || !asistencia.persona) {
      return false;
    }
    
    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      const nombreCompleto = `${asistencia.persona.nombre || ''} ${asistencia.persona.apellido || ''}`.toLowerCase();
      const cedula = asistencia.persona.cedula?.toLowerCase() || '';
      
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
                <p>No hay asistencias registradas para esta fecha</p>
              </div>
            ) : (
              <div className="space-y-3">
                {asistenciasFiltradas.map((asistencia) => {
                  // Validar que la asistencia y persona existan
                  if (!asistencia || !asistencia.persona) {
                    return null;
                  }
                  
                  return (
                    <div 
                      key={asistencia.id}
                      className={`p-4 rounded-lg border ${getAsistenciaColor(asistencia.tipo)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {asistencia.tipo === 'entrada' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <h4 className="font-semibold">
                              {asistencia.persona.nombre || ''} {asistencia.persona.apellido || ''}
                            </h4>
                            <p className="text-sm opacity-75 capitalize">
                              {asistencia.tipo} - {formatearFecha(asistencia.fecha_hora)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getAsistenciaColor(asistencia.tipo)}>
                          {asistencia.tipo}
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
          onConfirm={() => handleConfirmarAsistencia('entrada')}
          title="Confirmar Asistencia"
          confirmText="Registrar Entrada"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
};

export default Asistencias; 