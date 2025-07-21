import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Persona } from '@/types';
import api from '@/lib/axios';
import { nfcManager, NfcScanResult } from '@/lib/nfc';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Nfc, CheckCircle, XCircle, Search } from 'lucide-react';

const AsociarNFC: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<string>('');
  const [uidManual, setUidManual] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    cargarPersonas();
  }, []);

  const cargarPersonas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personas');
      // Filtrar personas que no tienen NFC asociado
      setPersonas(response.data.filter((p: Persona) => !p.nfc_uid && p.activo));
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

  const iniciarEscaneo = async () => {
    try {
      setScanning(true);
      setLastScanResult(null);
      
      const isSupported = await nfcManager.isSupported();
      if (!isSupported) {
        toast({
          title: "Error",
          description: "NFC no está soportado en este dispositivo",
          variant: "destructive",
        });
        return;
      }

      const result: NfcScanResult = await nfcManager.startScan();
      
      if (result.success && result.uid) {
        setLastScanResult(result.uid);
        setUidManual(result.uid);
        toast({
          title: "Tarjeta detectada",
          description: `UID: ${result.uid}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo leer la tarjeta NFC",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error en escaneo NFC:', error);
      toast({
        title: "Error",
        description: "Error al escanear tarjeta NFC",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const asociarNFC = async () => {
    if (!personaSeleccionada || !uidManual) {
      toast({
        title: "Error",
        description: "Selecciona una persona y proporciona un UID",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post(`/personas/${personaSeleccionada}/asociar-nfc`, {
        nfc_uid: uidManual
      });

      toast({
        title: "Asociación exitosa",
        description: "La tarjeta NFC ha sido asociada correctamente",
      });

      // Limpiar formulario y recargar personas
      setPersonaSeleccionada('');
      setUidManual('');
      setLastScanResult(null);
      await cargarPersonas();
    } catch (error: any) {
      console.error('Error asociando NFC:', error);
      const message = error.response?.data?.message || 'Error al asociar tarjeta NFC';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const personasFiltradas = personas.filter(persona =>
    busqueda === '' || 
    persona.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    persona.apellido.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading && personas.length === 0) {
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
              <Nfc className="w-5 h-5" />
              Asociar Tarjeta NFC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Escaneo NFC */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Escanear Tarjeta NFC</h3>
              
              <Button 
                onClick={iniciarEscaneo} 
                disabled={scanning}
                className="w-full"
                size="lg"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Nfc className="w-4 h-4 mr-2" />
                    Escanear Tarjeta NFC
                  </>
                )}
              </Button>

              {lastScanResult && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">
                    Tarjeta detectada: <code className="bg-green-100 px-2 py-1 rounded">{lastScanResult}</code>
                  </span>
                </div>
              )}

              {/* UID Manual */}
              <div className="space-y-2">
                <Label htmlFor="uidManual">UID de la tarjeta (manual)</Label>
                <Input
                  id="uidManual"
                  value={uidManual}
                  onChange={(e) => setUidManual(e.target.value.toUpperCase())}
                  placeholder="Ingresa el UID manualmente"
                />
              </div>
            </div>

            {/* Selección de persona */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Seleccionar Persona</h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar persona..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={personaSeleccionada} onValueChange={setPersonaSeleccionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una persona" />
                </SelectTrigger>
                <SelectContent>
                  {personasFiltradas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id.toString()}>
                      {persona.nombre} {persona.apellido} - {persona.tipo} ({persona.edad} años)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {personasFiltradas.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  {personas.length === 0 
                    ? "No hay personas disponibles para asociar NFC"
                    : "No se encontraron personas con ese nombre"
                  }
                </div>
              )}
            </div>

            {/* Botón de asociación */}
            <Button 
              onClick={asociarNFC}
              disabled={!personaSeleccionada || !uidManual || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Asociar Tarjeta NFC
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AsociarNFC;