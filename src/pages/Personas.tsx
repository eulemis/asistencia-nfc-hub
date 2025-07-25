import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-new';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Loader2, Users } from 'lucide-react';
import api from '@/lib/axios';
import { Persona } from '@/types';
import PersonaCard from '@/components/PersonaCard';
import { fetchGrupos, Grupo } from '@/lib/grupos';
import NfcScanner from '@/components/NfcScanner';
import FiltroEdad from '@/components/FiltroEdad';
import LoadingOverlay from '@/components/ui/loading-overlay';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const Personas: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  // Cargar grupos al montar
  useEffect(() => {
    const cargarGrupos = async () => {
      try {
        const data = await fetchGrupos();
        setGrupos(data);
      } catch (e) {
        setGrupos([]);
      }
    };
    cargarGrupos();
  }, []);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nfcScannerOpen, setNfcScannerOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isLinkingNfc, setIsLinkingNfc] = useState(false);
  const [linkingMessage, setLinkingMessage] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('hijo');
  const [filtroEdad, setFiltroEdad] = useState<string>('sin-filtro');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.length >= 3 || busqueda.length === 0) {
        setDebouncedBusqueda(busqueda);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [busqueda]);

  // Cargar personas cuando cambien los filtros
  useEffect(() => {
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


      // Si es un reset (búsqueda/filtro), siempre usar página 1
      const pageToUse = reset ? 1 : currentPage;
      const params = new URLSearchParams({
        tipo: filtroTipo,
        page: pageToUse.toString(),
      });

      if (filtroEdad !== 'sin-filtro') {
        const [edadMin, edadMax] = filtroEdad.split('-');
        params.append('edad_min', edadMin);
        params.append('edad_max', edadMax);
      }

      if (filtroGrupo !== 'todos') {
        params.append('grupo_id', filtroGrupo);
      }

      if (debouncedBusqueda) {
        params.append('busqueda', debouncedBusqueda);
      }

      const response = await api.get(`/personas?${params}`);
      
      let personasData: Persona[] = [];
      let paginationData = {
        total: 0,
        current_page: 1,
        last_page: 1
      };
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          personasData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          personasData = response.data.data;
          if (response.data.pagination) {
            paginationData = response.data.pagination;
          }
        }
      }

      if (reset) {
        setPersonas(personasData);
      } else {
        setPersonas(prev => [...prev, ...personasData]);
      }

      setHasMore(paginationData.current_page < paginationData.last_page);
      // Solo incrementar la página si no es reset (scroll o "ver más")
      if (!reset) {
        setCurrentPage(paginationData.current_page + 1);
      } else {
        setCurrentPage(2); // Si fue reset, la próxima será la página 2
      }
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
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    setSelectedPersona(persona);
    setNfcScannerOpen(true);
  };

  const handleNfcDetected = async (uid: string) => {
    if (!selectedPersona) return;

    try {
      setIsLinkingNfc(true);
      setLinkingMessage('Vinculando tarjeta NFC...');

      await api.post(`/personas/${selectedPersona.id}/vincular-nfc`, {
        nfc_uid: uid
      });

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
      
      if (error?.response?.data?.errors?.nfc_uid || 
          error?.response?.data?.message?.includes('ya ha sido usado')) {
        
        toast({
          title: "Tarjeta NFC ya vinculada",
          description: "Esta tarjeta NFC ya está asociada a otra persona.",
          variant: "destructive",
          className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error al vincular NFC",
          variant: "destructive",
        });
      }
    } finally {
      setIsLinkingNfc(false);
      setLinkingMessage('');
      setSelectedPersona(null);
    }
  };

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
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      cargarPersonas(false);
    }
  }, [loadingMore, hasMore]);

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
              
              <FiltroEdad 
                filtrosEdad={[
                  { label: '8 a 9 años', edad_min: 8, edad_max: 9 },
                  { label: '10 a 11 años', edad_min: 10, edad_max: 11 },
                  { label: '12 a 13 años', edad_min: 12, edad_max: 13 },
                  { label: '14 a 17 años', edad_min: 14, edad_max: 17 },
                ]}
                valorSeleccionado={filtroEdad}
                onCambio={handleFiltroEdadChange}
              />
              
              <Select value={filtroGrupo} onValueChange={handleFiltroGrupoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grupos</SelectItem>
                  {grupos.map((grupo) => (
                    <SelectItem key={grupo.id} value={String(grupo.id)}>
                      {grupo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroTipo('hijo');
                  setFiltroEdad('sin-filtro');
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

      {/* Overlay de carga para vinculación NFC */}
      <LoadingOverlay 
        isVisible={isLinkingNfc}
        message={linkingMessage}
      />
    </div>
  );
};

export default Personas;