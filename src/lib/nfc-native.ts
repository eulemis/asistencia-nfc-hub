import { Capacitor } from '@capacitor/core';

// Función para convertir UID sin formato a formato con dos puntos
function formatUID(uid: string): string {
  // Si ya tiene dos puntos, devolverlo tal como está
  if (uid.includes(':')) {
    return uid.toUpperCase();
  }
  
  // Convertir UID sin formato a formato con dos puntos
  // Ejemplo: "C4DEC42D" -> "C4:DE:C4:2D"
  const formatted = uid.match(/.{1,2}/g)?.join(':').toUpperCase() || uid.toUpperCase();
  return formatted;
}

// Función para verificar si NFC está disponible
export const isNfcAvailable = async (): Promise<boolean> => {
  try {
    // En Android, verificar si el plugin está disponible
    if (Capacitor.isNativePlatform()) {
      console.log('Verificando NFC nativo en Android...');
      
      // Por ahora, asumimos que NFC está disponible en Android
      // Esto se actualizará cuando instales el nuevo plugin
      return true;
    }
    
    // En web, no soportamos NFC
    console.log('NFC no soportado en web');
    return false;
  } catch (error) {
    console.log('Error verificando NFC:', error);
    return false;
  }
};

// Función para escanear NFC (placeholder para el nuevo plugin)
export const scanNfcNative = async (): Promise<string> => {
  if (!Capacitor.isNativePlatform()) {
    console.error('[NFC] El dispositivo no es Android/iOS nativo.');
    throw new Error('NFC nativo solo está disponible en dispositivos Android/iOS reales.');
  }
  try {
    // Intentar obtener el plugin desde Capacitor
    // @ts-expect-error: Acceso dinámico a plugin nativo
    const NfcUidReader = (window as any).Capacitor?.Plugins?.NfcUidReader || (typeof require !== 'undefined' ? require('capacitor-nfc-uid-reader').default : undefined);
    if (!NfcUidReader || !NfcUidReader.startReading) {
      console.error('[NFC] Plugin capacitor-nfc-uid-reader no está disponible o no tiene startReading.');
      throw new Error('El plugin capacitor-nfc-uid-reader no está disponible. ¿Sincronizaste y compilaste el proyecto?');
    }
    console.log('[NFC] Iniciando lectura de UID con plugin nativo...');
    const { uid } = await NfcUidReader.startReading();
    console.log('[NFC] UID leído correctamente:', uid);
    return formatUID(uid);
  } catch (error) {
    console.error('[NFC] Error leyendo UID:', error);
    throw new Error('Error leyendo NFC UID: ' + (error?.message || String(error)));
  }
};

// Función para escanear NFC Web (fallback)
export const scanNfcWeb = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!('NDEFReader' in window)) {
      console.error('[WebNFC] Web NFC API no está disponible en este navegador.');
      reject(new Error('Web NFC API no está disponible en este navegador.'));
      return;
    }

    console.log('[WebNFC] Iniciando escaneo Web NFC...');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ndef = new (window as any).NDEFReader();
      ndef.scan()
        .then(() => {
          console.log('[WebNFC] Escaneo Web NFC iniciado correctamente');
          ndef.addEventListener('reading', (event: any) => {
            console.log('[WebNFC] NFC detectado:', event);
            try {
              let uid = null;
              if (event.serialNumber) {
                uid = formatUID(event.serialNumber);
              } else if (event.id) {
                uid = formatUID(event.id);
              } else if (event.uid) {
                uid = formatUID(event.uid);
              }
              if (uid) {
                console.log('[WebNFC] UID capturado exitosamente:', uid);
                resolve(uid);
              } else {
                console.warn('[WebNFC] No se pudo extraer UID de los datos NFC');
                reject(new Error('No se pudo extraer UID de la tarjeta NFC.'));
              }
            } catch (error) {
              console.error('[WebNFC] Error procesando datos NFC:', error);
              reject(error);
            }
          });
          ndef.addEventListener('readingerror', (error: any) => {
            console.error('[WebNFC] Error durante el escaneo NFC:', error);
            reject(error);
          });
        })
        .catch((error: any) => {
          console.error('[WebNFC] Error iniciando Web NFC scanner:', error);
          reject(error);
        });
    } catch (error) {
      console.error('[WebNFC] Error configurando Web NFC:', error);
      reject(error);
    }
  });
};

// Función para obtener información del dispositivo NFC
export const getNfcInfo = () => {
  return {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    webNfcAvailable: 'NDEFReader' in window,
    userAgent: navigator.userAgent,
    https: location.protocol === 'https:',
    hostname: location.hostname
  };
};

// Función para inicializar NFC
export const initNfcPlugin = async (): Promise<boolean> => {
  try {
    const isAvailable = await isNfcAvailable();
    console.log('NFC inicializado:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('Error inicializando NFC:', error);
    return false;
  }
}; 