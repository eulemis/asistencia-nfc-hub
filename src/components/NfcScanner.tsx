import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Nfc, Loader2, CheckCircle, XCircle, Smartphone, Key, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scanNfcNative, scanNfcWeb, isNfcAvailable, getNfcInfo, initNfcPlugin } from '@/lib/nfc-native';

interface NfcScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onNfcDetected: (uid: string) => void;
  personaNombre?: string;
}

const NfcScanner: React.FC<NfcScannerProps> = ({
  isOpen, 
  onClose, 
  onNfcDetected, 
  personaNombre 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUid, setScannedUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualUid, setManualUid] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nativeNfcAvailable, setNativeNfcAvailable] = useState(false);
  const [nfcInfo, setNfcInfo] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar capacidades NFC
    const checkNfcCapabilities = async () => {
      setIsInitializing(true);
      
      try {
        const info = getNfcInfo();
        setNfcInfo(info);
        
        // Verificar Web NFC
        const webNfcSupported = 'NDEFReader' in window;
        setNfcSupported(webNfcSupported);
        
        // Inicializar y verificar NFC nativo
        try {
          console.log('Inicializando plugin NFC...');
          const nativeAvailable = await initNfcPlugin();
          setNativeNfcAvailable(nativeAvailable);
          console.log('NFC nativo disponible:', nativeAvailable);
        } catch (error) {
          console.log('Error inicializando NFC nativo:', error);
          setNativeNfcAvailable(false);
        }
        
        // Si no hay NFC disponible, mostrar opción manual
        if (!webNfcSupported && !nativeNfcAvailable) {
          setError('NFC no está disponible en este dispositivo. Puedes ingresar el UID manualmente.');
          setShowManualInput(true);
        }
      } catch (error) {
        console.error('Error verificando capacidades NFC:', error);
        setError('Error verificando capacidades NFC');
      } finally {
        setIsInitializing(false);
      }
    };

    checkNfcCapabilities();
  }, []);

  useEffect(() => {
    if (isOpen && (nfcSupported || nativeNfcAvailable)) {
      // No iniciar automáticamente, esperar que el usuario elija
    } else if (!isOpen) {
      stopScanning();
    }
  }, [isOpen, nfcSupported, nativeNfcAvailable]);

  const startWebScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScannedUid(null);

      if (!nfcSupported) {
        throw new Error('NFC Web no está disponible en este dispositivo');
      }

      console.log('Iniciando escaneo NFC Web...');
      
      const uid = await scanNfcWeb();
      
      if (uid) {
        setScannedUid(uid);
        setIsScanning(false);
        
        console.log('UID capturado exitosamente con Web NFC:', uid);
        
        toast({
          title: "NFC Detectado",
          description: `UID: ${uid}`,
        });
      } else {
        setError('No se pudo leer el UID de la tarjeta NFC. Intenta de nuevo.');
        setIsScanning(false);
      }

    } catch (err: any) {
      console.error('Error iniciando NFC Web scanner:', err);
      
      let errorMessage = 'Error al iniciar el escáner NFC Web';
      if (err.message.includes('permission')) {
        errorMessage = 'Permiso denegado para NFC. Verifica que NFC esté activado en tu dispositivo.';
      } else if (err.message.includes('not supported')) {
        errorMessage = 'NFC Web no está disponible en este dispositivo.';
      } else if (err.message.includes('HTTPS')) {
        errorMessage = 'NFC Web requiere HTTPS. La app debe estar en un servidor seguro.';
      } else if (err.message.includes('Tiempo de espera')) {
        errorMessage = 'No se detectó actividad NFC. Verifica que NFC esté activado y acerques la tarjeta al dispositivo.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const startNativeScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScannedUid(null);

      console.log('Iniciando escaneo NFC nativo...');
      
      // Re-verificar disponibilidad antes de escanear
      const available = await isNfcAvailable();
      if (!available) {
        throw new Error('NFC nativo no está disponible. Verifica que NFC esté activado.');
      }
      
      const uid = await scanNfcNative();
      
      if (uid) {
        setScannedUid(uid);
        setIsScanning(false);
        
        console.log('UID capturado exitosamente con NFC nativo:', uid);
        
        toast({
          title: "NFC Detectado",
          description: `UID: ${uid}`,
        });
      } else {
        setError('No se pudo leer el UID de la tarjeta NFC. Intenta de nuevo.');
        setIsScanning(false);
      }
      
    } catch (err: any) {
      console.error('Error en escaneo NFC nativo:', err);
      setError(err.message || 'Error al leer la tarjeta NFC');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setError(null);
  };

  const handleConfirm = () => {
    const uidToUse = scannedUid || manualUid;
    if (uidToUse && uidToUse.trim()) {
      onNfcDetected(uidToUse.trim());
      onClose();
    } else {
      setError('Por favor, ingresa un UID válido');
    }
  };

  const handleRetry = () => {
    setError(null);
    setScannedUid(null);
    setManualUid('');
    setShowManualInput(false);
  };

  const handleManualSubmit = () => {
    if (manualUid && manualUid.trim()) {
      onNfcDetected(manualUid.trim());
      onClose();
    } else {
      setError('Por favor, ingresa un UID válido');
    }
  };

  // Función para manejar errores de NFC ya vinculado
  const handleNfcError = (error: any) => {
    console.error('Error NFC:', error);
    
    // Verificar si es un error de NFC ya vinculado
    if (error?.response?.data?.errors?.nfc_uid || 
        error?.message?.includes('ya ha sido usado') ||
        error?.message?.includes('already been used')) {
      
      toast({
        title: "Tarjeta NFC ya vinculada",
        description: "Esta tarjeta NFC ya está asociada a otra persona.",
        variant: "destructive",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
      
      setError('Esta tarjeta NFC ya está vinculada a otra persona');
      return;
    }
    
    // Otros errores
    let errorMessage = 'Error al procesar la tarjeta NFC';
    if (error?.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Nfc className="w-5 h-5" />
            Vincular NFC
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {personaNombre && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Vinculando NFC para: <strong>{personaNombre}</strong>
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 text-center">
              {isInitializing && (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Inicializando NFC...</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Verificando capacidades del dispositivo
                    </p>
                  </div>
                </div>
              )}

              {isScanning && !scannedUid && !error && (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Escaneando NFC...</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Acerca la tarjeta NFC al dispositivo
                    </p>
                  </div>
                </div>
              )}

              {scannedUid && (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <div>
                    <h3 className="font-semibold text-green-600">NFC Detectado</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      UID: <code className="bg-gray-100 px-2 py-1 rounded">{scannedUid}</code>
                    </p>
                  </div>
                  <Button onClick={handleConfirm} className="w-full">
                    Confirmar y Vincular
                  </Button>
                </div>
              )}

              {error && !showManualInput && (
                <div className="space-y-4">
                  <XCircle className="w-12 h-12 mx-auto text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-600">Error</h3>
                    <p className="text-sm text-muted-foreground mt-2">{error}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleRetry} variant="outline" className="flex-1">
                      Reintentar
                    </Button>
                    {/* Solo mostrar la opción manual si NO hay NFC disponible */}
                    {(!nfcSupported && !nativeNfcAvailable) && (
                      <Button onClick={() => setShowManualInput(true)} variant="outline" className="flex-1">
                        Ingresar Manualmente
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {showManualInput && (
                <div className="space-y-4">
                  <Key className="w-12 h-12 mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Ingresar UID Manualmente</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ingresa el código UID de la tarjeta NFC
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-uid">UID de la Tarjeta NFC</Label>
                    <Input
                      id="manual-uid"
                      placeholder="Ej: 04A3B2C1D4E5F6"
                      value={manualUid}
                      onChange={(e) => setManualUid(e.target.value)}
                      className="text-center font-mono"
                    />
                  </div>
                  <Button onClick={handleManualSubmit} className="w-full">
                    Vincular NFC
                  </Button>
                </div>
              )}

              {!isInitializing && !isScanning && !scannedUid && !error && !showManualInput && (
                <div className="space-y-4">
                  <Nfc className="w-12 h-12 mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Escanear NFC</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Acerca la tarjeta NFC al dispositivo
                    </p>
                  </div>
                  <div className="space-y-2">
                    {nativeNfcAvailable && (
                      <Button onClick={startNativeScanning} className="w-full bg-blue-500 hover:bg-blue-600">
                        <Zap className="w-4 h-4 mr-2" />
                        NFC Nativo
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!isInitializing && !nfcSupported && !nativeNfcAvailable && !showManualInput && (
                <div className="space-y-4">
                  <Smartphone className="w-12 h-12 mx-auto text-orange-500" />
                  <div>
                    <h3 className="font-semibold">NFC No Disponible</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tu dispositivo no soporta NFC. Puedes ingresar el UID manualmente.
                    </p>
                  </div>
                  <Button onClick={() => setShowManualInput(true)} className="w-full">
                    Ingresar UID Manualmente
                  </Button>
                </div>
              )}

              {/* Información de debugging */}
              {nfcInfo && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Información de NFC</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p><strong>Plataforma:</strong> {nfcInfo.platform}</p>
                      <p><strong>Nativo:</strong> {nfcInfo.isNative ? 'Sí' : 'No'}</p>
                      <p><strong>NFC Web:</strong> {nfcSupported ? 'Sí' : 'No'}</p>
                      <p><strong>NFC Nativo:</strong> {nativeNfcAvailable ? 'Sí' : 'No'}</p>
                      <p><strong>Plugin NFC:</strong> {nfcInfo.nfcPluginLoaded ? 'Sí' : 'No'}</p>
                      <p><strong>Métodos Plugin:</strong> {nfcInfo.nfcPluginMethods?.join(', ') || 'N/A'}</p>
                      <p><strong>HTTPS:</strong> {nfcInfo.https ? 'Sí' : 'No'}</p>
                      <p><strong>Estado:</strong> {isScanning ? 'Escaneando...' : isInitializing ? 'Inicializando...' : 'Listo'}</p>
                    </div>
                    <div className="mt-3 text-xs text-blue-600">
                      <p><strong>Consejos:</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Asegúrate de que NFC esté activado en tu dispositivo</li>
                        <li>Acerca la tarjeta NFC a la parte trasera del teléfono</li>
                        <li>Mantén la tarjeta cerca por 2-3 segundos</li>
                        <li>Web NFC es más confiable en Chrome Android</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            {(scannedUid || manualUid) && (
              <Button onClick={handleConfirm} className="flex-1">
                Vincular NFC
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NfcScanner; 