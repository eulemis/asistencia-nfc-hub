import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Persona, ApiResponse } from '@/types';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Users } from 'lucide-react';
import PersonaCard from '@/components/PersonaCard';
import FiltroEdadSelector from '@/components/FiltroEdad';
import GrupoSelector from '@/components/GrupoSelector';
import NfcScanner from '@/components/NfcScanner';
import { useAuth } from '@/contexts/AuthContext';

const Personas: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('hijo');
  const [filtroEdad, setFiltroEdad] = useState<string>('todos');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [nfcScannerOpen, setNfcScannerOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Debounce para búsqueda (aumentado a 800ms como en apps grandes)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo buscar si hay 3 o más caracteres
      if (busqueda.length >= 3 || busqueda.length === 0) {
        setDebouncedBusqueda(busqueda);
      }
    }, 800); // Aumentado de 300ms a 800ms

    return () => clearTimeout(timer);
  }, [busqueda]);

  // Cargar personas cuando cambien los filtros
  useEffect(() => {
    console.log('Filtros cambiados:', {
      filtroTipo,
      filtroEdad,
      filtroGrupo,
      debouncedBusqueda
    });
    
    setCurrentPage(1);
    setPersonas([]);
    cargarPersonas(true);
  }, [filtroTipo, filtroEdad, filtroGrupo, debouncedBusqueda]);

  const cargarPersonas = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        tipo: filtroTipo,
        page: currentPage.toString(),
      });

      if (filtroEdad !== 'todos') {
        const [edadMin, edadMax] = filtroEdad.split('-');
        params.append('edad_min', edadMin);
        params.append('edad_max', edadMax);
        console.log('Aplicando filtro de edad:', { filtroEdad, edadMin, edadMax });
      }

      if (filtroGrupo !== 'todos') {
        params.append('grupo_id', filtroGrupo);
        console.log('Aplicando filtro de grupo:', filtroGrupo);
      }

      if (debouncedBusqueda) {
        params.append('busqueda', debouncedBusqueda);
        console.log('Aplicando búsqueda:', debouncedBusqueda);
      }

      console.log('URL de la petición:', `/personas?${params}`);
      const response = await api.get(`/personas?${params}`);
      const data: ApiResponse<Persona> = response.data;

      console.log('Respuesta del servidor:', {
        total: data.pagination.total,
        currentPage: data.pagination.current_page,
        lastPage: data.pagination.last_page,
        personasCount: data.data.length
      });

      if (reset) {
        setPersonas(data.data);
      } else {
        setPersonas(prev => [...prev, ...data.data]);
      }

      setHasMore(data.pagination.current_page < data.pagination.last_page);
      setCurrentPage(data.pagination.current_page + 1);
    } catch (error) {
      console.error('Error cargando personas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las personas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleVincularNfc = async (personaId: number) => {
    // Encontrar la persona seleccionada
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    setSelectedPersona(persona);
    setNfcScannerOpen(true);
  };

  const handleNfcDetected = async (uid: string) => {
    if (!selectedPersona) return;

    try {
      await api.post(`/personas/${selectedPersona.id}/vincular-nfc`, {
        nfc_uid: uid
      });

      // Actualizar la persona en la lista
      setPersonas(prev => prev.map(p => 
        p.id === selectedPersona.id 
          ? { ...p, nfc_uid: uid }
          : p
      ));

      toast({
        title: "Éxito",
        description: `NFC vinculado exitosamente a ${selectedPersona.nombre} ${selectedPersona.apellido}`,
      });
    } catch (error: any) {
      console.error('Error vinculando NFC:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al vincular NFC",
        variant: "destructive",
      });
    } finally {
      setSelectedPersona(null);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      cargarPersonas(false);
    }
  }, [loadingMore, hasMore]);

  // Cambios en los handlers de filtros para reiniciar página

  const handleFiltroTipoChange = (value: string) => {
    setFiltroTipo(value);
    setCurrentPage(1);
  };

  const handleFiltroEdadChange = (value: string) => {
    setFiltroEdad(value);
    setCurrentPage(1);
  };

  const handleFiltroGrupoChange = (value: string) => {
    setFiltroGrupo(value);
    setCurrentPage(1);
  };

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personas Registradas
              {user && (
                <span className="text-sm text-muted-foreground ml-auto">
                  Bienvenido, {user.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={busqueda}
                  onChange={handleBusquedaChange}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroTipo} onValueChange={handleFiltroTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hijo">Niños</SelectItem>
                  <SelectItem value="animador">Animadores</SelectItem>
                </SelectContent>
              </Select>
              
              <FiltroEdadSelector value={filtroEdad} onValueChange={handleFiltroEdadChange} />
              
              <GrupoSelector value={filtroGrupo} onValueChange={handleFiltroGrupoChange} />
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroTipo('hijo');
                  setFiltroEdad('todos');
                  setFiltroGrupo('todos');
                  setBusqueda('');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>

            {/* Lista de personas */}
            <div className="space-y-3">
              {personas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron personas con los filtros aplicados
                </div>
              ) : (
                <>
                  {personas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onVincularNfc={handleVincularNfc}
                    />
                  ))}
                  
                  {hasMore && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          'Cargar más'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {nfcScannerOpen && selectedPersona && (
        <NfcScanner
          isOpen={nfcScannerOpen}
          onClose={() => setNfcScannerOpen(false)}
          onNfcDetected={handleNfcDetected}
          personaNombre={`${selectedPersona.nombre} ${selectedPersona.apellido}`}
        />
      )}
    </div>
  );
};

export default Personas;