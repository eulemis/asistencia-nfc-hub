import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Nfc, Loader2, CheckCircle, XCircle, Smartphone, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si NFC está disponible
    const checkNfcSupport = () => {
      const supported = 'NDEFReader' in window;
      setNfcSupported(supported);
      
      if (!supported) {
        setError('NFC no está disponible en este dispositivo. Puedes ingresar el UID manualmente.');
        setShowManualInput(true);
      }
    };

    checkNfcSupport();
  }, []);

  useEffect(() => {
    if (isOpen && nfcSupported) {
      startScanning();
    } else if (!isOpen) {
      stopScanning();
    }
  }, [isOpen, nfcSupported]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScannedUid(null);

      if (!nfcSupported) {
        throw new Error('NFC no está disponible en este dispositivo');
      }

      console.log('Iniciando escaneo NFC...');
      console.log('Navegador:', navigator.userAgent);
      console.log('HTTPS:', window.location.protocol === 'https:');

      // @ts-ignore - NDEFReader es una API experimental
      const ndef = new (window as any).NDEFReader();
      
      await ndef.scan();
      console.log('Escaneo NFC iniciado correctamente');
      
      ndef.addEventListener('reading', (event: any) => {
        console.log('Evento reading detectado:', event);
        console.log('Propiedades del evento:', {
          serialNumber: event.serialNumber,
          message: event.message,
          records: event.message?.records,
          data: event.data,
          type: event.type,
          url: event.url
        });

        // Intentar obtener el UID de diferentes propiedades
        let uid = null;
        
        // Método 1: serialNumber directo
        if (event.serialNumber) {
          uid = event.serialNumber;
          console.log('UID encontrado en serialNumber:', uid);
        }
        // Método 2: buscar en los records
        else if (event.message?.records) {
          for (const record of event.message.records) {
            console.log('Record encontrado:', record);
            if (record.data) {
              // Convertir ArrayBuffer a string hexadecimal
              const dataView = new DataView(record.data);
              const uidBytes = [];
              for (let i = 0; i < Math.min(dataView.byteLength, 8); i++) {
                uidBytes.push(dataView.getUint8(i).toString(16).padStart(2, '0'));
              }
              uid = uidBytes.join('').toUpperCase();
              console.log('UID extraído de record data:', uid);
              break;
            }
          }
        }
        // Método 3: buscar en el data del evento
        else if (event.data) {
          const dataView = new DataView(event.data);
          const uidBytes = [];
          for (let i = 0; i < Math.min(dataView.byteLength, 8); i++) {
            uidBytes.push(dataView.getUint8(i).toString(16).padStart(2, '0'));
          }
          uid = uidBytes.join('').toUpperCase();
          console.log('UID extraído de event.data:', uid);
        }

        if (uid && uid !== 'unknown') {
          setScannedUid(uid);
          setIsScanning(false);
          
          console.log('UID capturado exitosamente:', uid);
          
          toast({
            title: "NFC Detectado",
            description: `UID: ${uid}`,
          });
        } else {
          console.log('No se pudo extraer UID válido del evento');
          setError('Se detectó la tarjeta NFC pero no se pudo leer el UID. Intenta de nuevo o ingresa el UID manualmente.');
          setIsScanning(false);
          setShowManualInput(true);
        }
      });

      ndef.addEventListener('readingerror', (error: any) => {
        console.error('Error de lectura NFC:', error);
        setError('Error al leer la tarjeta NFC. Intenta de nuevo o ingresa el UID manualmente.');
        setIsScanning(false);
        setShowManualInput(true);
      });

      // Agregar timeout para detectar si no se activa NFC
      setTimeout(() => {
        if (isScanning && !scannedUid && !error) {
          console.log('Timeout: NFC no se activó en 10 segundos');
          setError('No se detectó actividad NFC. Verifica que NFC esté activado y acerques la tarjeta al dispositivo.');
          setIsScanning(false);
          setShowManualInput(true);
        }
      }, 10000);

    } catch (err: any) {
      console.error('Error iniciando NFC scanner:', err);
      
      // Mensaje más específico según el error
      let errorMessage = 'Error al iniciar el escáner NFC';
      if (err.message.includes('permission')) {
        errorMessage = 'Permiso denegado para NFC. Verifica que NFC esté activado en tu dispositivo.';
      } else if (err.message.includes('not supported')) {
        errorMessage = 'NFC no está disponible en este dispositivo.';
      } else if (err.message.includes('HTTPS')) {
        errorMessage = 'NFC requiere HTTPS. La app debe estar en un servidor seguro.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
      setShowManualInput(true);
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
      toast({
        title: "Error",
        description: "Debes ingresar un UID válido",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    setScannedUid(null);
    setManualUid('');
    setShowManualInput(false);
    if (nfcSupported) {
      startScanning();
    }
  };

  const handleManualSubmit = () => {
    if (manualUid.trim()) {
      onNfcDetected(manualUid.trim());
      onClose();
    } else {
      toast({
        title: "Error",
        description: "Debes ingresar un UID válido",
        variant: "destructive",
      });
    }
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
                    <Button onClick={() => setShowManualInput(true)} variant="outline" className="flex-1">
                      Ingresar Manualmente
                    </Button>
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

              {!isScanning && !scannedUid && !error && !showManualInput && (
                <div className="space-y-4">
                  <Nfc className="w-12 h-12 mx-auto text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Escanear NFC</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Elige el método de escaneo
                    </p>
                  </div>
                  <div className="space-y-2">
                    {nfcSupported && (
                      <Button onClick={startScanning} className="w-full" variant="outline">
                        <Nfc className="w-4 h-4 mr-2" />
                        NFC Web
                      </Button>
                    )}
                    <Button onClick={() => setShowManualInput(true)} className="w-full" variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Ingresar Manualmente
                    </Button>
                  </div>
                </div>
              )}

              {!nfcSupported && !showManualInput && (
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
              {isScanning && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Información de NFC</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p><strong>Navegador:</strong> {navigator.userAgent.substring(0, 50)}...</p>
                      <p><strong>Protocolo:</strong> {window.location.protocol}</p>
                      <p><strong>NFC Web:</strong> {nfcSupported ? 'Sí' : 'No'}</p>
                      <p><strong>Estado:</strong> Escaneando...</p>
                    </div>
                    <div className="mt-3 text-xs text-blue-600">
                      <p><strong>Consejos:</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Asegúrate de que NFC esté activado en tu dispositivo</li>
                        <li>Acerca la tarjeta NFC a la parte trasera del teléfono</li>
                        <li>Mantén la tarjeta cerca por 2-3 segundos</li>
                        <li>Si no funciona, usa la opción manual</li>
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