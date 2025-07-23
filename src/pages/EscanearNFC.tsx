import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NfcData, Asistencia } from '@/types';
import api from '@/lib/axios';
import { nfcManager, NfcScanResult } from '@/lib/nfc';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Nfc, CheckCircle, XCircle, Search, Clock, User, Smartphone } from 'lucide-react';

const EscanearNFC: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [nfcData, setNfcData] = useState<NfcData | null>(null);
  const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false);
  const { toast } = useToast();

  const iniciarEscaneo = async () => {
    try {
      setScanning(true);
      setNfcData(null);
      
      const isSupported = await nfcManager.isSupported();
      if (!isSupported) {
        toast({
          title: "Error",
          description: "NFC no está soportado en este dispositivo",
          variant: "destructive",
        });
        return;
      }

      console.log('Iniciando escaneo NFC nativo...');
      const result: NfcScanResult = await nfcManager.startScan('native');
      
      if (result.success && result.uid) {
        await consultarNFC(result.uid);
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

  const consultarNFC = async (uid: string) => {
    try {
      const response = await api.get(`/nfc/${uid}`);
      setNfcData(response.data);
      
      if (response.data.persona) {
        toast({
          title: "Persona encontrada",
          description: `${response.data.persona.nombre} ${response.data.persona.apellido}`,
        });
      } else {
        toast({
          title: "Tarjeta no asociada",
          description: "Esta tarjeta NFC no está asociada a ninguna persona",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error consultando NFC:', error);
      const message = error.response?.data?.message || 'Error al consultar tarjeta NFC';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setNfcData(null);
    }
  };

  const registrarAsistencia = async (tipo: 'entrada' | 'salida') => {
    if (!nfcData?.persona) {
      toast({
        title: "Error",
        description: "No hay persona asociada para registrar asistencia",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegistrandoAsistencia(true);
      
      await api.post('/asistencias', {
        persona_id: nfcData.persona.id,
        tipo: tipo,
        nfc_uid: nfcData.uid
      });

      toast({
        title: "Asistencia registrada",
        description: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada para ${nfcData.persona.nombre} ${nfcData.persona.apellido}`,
      });

      // Actualizar datos para mostrar la nueva asistencia
      await consultarNFC(nfcData.uid);
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

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'niño': return 'bg-blue-100 text-blue-800';
      case 'joven': return 'bg-green-100 text-green-800';
      case 'adulto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAsistenciaColor = (tipo: string) => {
    return tipo === 'entrada' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Escanear NFC para Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información del dispositivo */}
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">NFC Nativo (Android)</p>
                  <p className="text-sm text-blue-600">Usa el plugin nativo para capturar el UID físico</p>
                </div>
              </div>
            </div>

            {/* Escaneo automático */}
            <div className="space-y-4">
              <Button 
                onClick={iniciarEscaneo} 
                disabled={scanning}
                className="w-full bg-blue-500 hover:bg-blue-600"
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
            </div>

            {/* Datos de la persona */}
            {nfcData && (
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4">
                  {nfcData.persona ? (
                    <div className="space-y-4">
                      {/* Información de la persona */}
                      <div className="flex items-center gap-3 pb-3 border-b">
                        <User className="w-8 h-8 text-primary" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">
                            {nfcData.persona.nombre} {nfcData.persona.apellido}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTipoColor(nfcData.persona.tipo)}>
                              {nfcData.persona.tipo}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {nfcData.persona.edad} años
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de asistencia */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => registrarAsistencia('entrada')}
                          disabled={registrandoAsistencia}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {registrandoAsistencia ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Registrar Entrada
                        </Button>
                        
                        <Button 
                          onClick={() => registrarAsistencia('salida')}
                          disabled={registrandoAsistencia}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {registrandoAsistencia ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Registrar Salida
                        </Button>
                      </div>

                      {/* Asistencias del día */}
                      {nfcData.asistencias_hoy && nfcData.asistencias_hoy.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Asistencias de hoy
                          </h4>
                          <div className="space-y-2">
                            {nfcData.asistencias_hoy.map((asistencia: Asistencia) => (
                              <div 
                                key={asistencia.id}
                                className={`p-3 rounded-lg border ${getAsistenciaColor(asistencia.tipo)}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium capitalize">
                                    {asistencia.tipo}
                                  </span>
                                  <span className="text-sm">
                                    {formatearFecha(asistencia.fecha_hora)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-red-700">
                        Tarjeta no asociada
                      </h3>
                      <p className="text-red-600">
                        UID: <code className="bg-red-50 px-2 py-1 rounded">{nfcData.uid}</code>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Esta tarjeta no está asociada a ninguna persona
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscanearNFC;