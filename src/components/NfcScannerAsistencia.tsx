import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Nfc, Smartphone } from 'lucide-react';
import { nfcManager, NfcScanResult } from '@/lib/nfc';
import { useToast } from '@/hooks/use-toast';

interface NfcScannerAsistenciaProps {
  onScanSuccess: (uid: string) => void;
  onScanError?: (error: string) => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

const NfcScannerAsistencia: React.FC<NfcScannerAsistenciaProps> = ({
  onScanSuccess,
  onScanError,
  buttonText = "Escanear Tarjeta NFC",
  className = "",
  disabled = false
}) => {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const iniciarEscaneo = async () => {
    try {
      setScanning(true);
      
      const isSupported = await nfcManager.isSupported();
      if (!isSupported) {
        const errorMsg = "NFC no está soportado en este dispositivo";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        onScanError?.(errorMsg);
        return;
      }

      console.log('Iniciando escaneo NFC nativo...');
      const result: NfcScanResult = await nfcManager.startScan('native');
      
      if (result.success && result.uid) {
        console.log('UID capturado exitosamente:', result.uid);
        onScanSuccess(result.uid);
        toast({
          title: "Tarjeta detectada",
          description: `UID: ${result.uid}`,
        });
      } else {
        const errorMsg = result.error || "No se pudo leer la tarjeta NFC";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        onScanError?.(errorMsg);
      }
    } catch (error) {
      console.error('Error en escaneo NFC:', error);
      const errorMsg = "Error al escanear tarjeta NFC";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      onScanError?.(errorMsg);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
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

      {/* Botón de escaneo */}
      <Button 
        onClick={iniciarEscaneo} 
        disabled={scanning || disabled}
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
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
};

export default NfcScannerAsistencia; 