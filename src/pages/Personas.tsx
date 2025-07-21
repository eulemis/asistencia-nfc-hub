import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Persona } from '@/types';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Users, Nfc } from 'lucide-react';

const Personas: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEdad, setFiltroEdad] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    cargarPersonas();
  }, []);

  const cargarPersonas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personas');
      setPersonas(response.data);
    } catch (error) {
      console.error('Error cargando personas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las personas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const personasFiltradas = personas.filter(persona => {
    const cumpleTipo = filtroTipo === 'todos' || persona.tipo === filtroTipo;
    const cumpleEdad = filtroEdad === 'todos' || 
      (filtroEdad === 'menor18' && persona.edad < 18) ||
      (filtroEdad === 'mayor18' && persona.edad >= 18);
    const cumpleBusqueda = busqueda === '' || 
      persona.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleTipo && cumpleEdad && cumpleBusqueda && persona.activo;
  });

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'niño': return 'bg-blue-100 text-blue-800';
      case 'joven': return 'bg-green-100 text-green-800';
      case 'adulto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="niño">Niños</SelectItem>
                  <SelectItem value="joven">Jóvenes</SelectItem>
                  <SelectItem value="adulto">Adultos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtroEdad} onValueChange={setFiltroEdad}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por edad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las edades</SelectItem>
                  <SelectItem value="menor18">Menores de 18</SelectItem>
                  <SelectItem value="mayor18">18 años o más</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de personas */}
            <div className="space-y-3">
              {personasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron personas con los filtros aplicados
                </div>
              ) : (
                personasFiltradas.map((persona) => (
                  <Card key={persona.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {persona.nombre} {persona.apellido}
                            </h3>
                            <Badge className={getTipoColor(persona.tipo)}>
                              {persona.tipo}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Edad: {persona.edad} años</p>
                            {persona.email && <p>Email: {persona.email}</p>}
                            {persona.telefono && <p>Teléfono: {persona.telefono}</p>}
                          </div>
                          
                          {persona.nfc_uid && (
                            <div className="flex items-center gap-1 mt-2 text-green-600">
                              <Nfc className="w-4 h-4" />
                              <span className="text-xs">NFC Asociado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Personas;