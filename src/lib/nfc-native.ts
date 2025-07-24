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
      
      try {
        // Verificar si NFC está habilitado usando el plugin
        const { registerPlugin } = await import('@capacitor/core');
        const NFCPlug = registerPlugin('NFC') as any;
        const result = await NFCPlug.isSupported();
        console.log('NFC está soportado:', result.supported);
        return result.supported;
      } catch (error) {
        console.log('Error verificando si NFC está habilitado:', error);
        return false;
      }
    }
    
    // En web, no soportamos NFC
    console.log('NFC no soportado en web');
    return false;
  } catch (error) {
    console.log('Error verificando NFC:', error);
    return false;
  }
};

// Función para escanear NFC usando @exxili/capacitor-nfc
export const scanNfcNative = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!Capacitor.isNativePlatform()) {
      reject(new Error('NFC nativo solo está disponible en Android'));
      return;
    }

    try {
      console.log('Iniciando escaneo NFC con implementación directa...');
      
      // Importar el plugin directamente
      const { registerPlugin } = await import('@capacitor/core');
      const NFCPlug = registerPlugin('NFC') as any;
      
      console.log('Plugin NFC registrado:', NFCPlug);
      
      // Configurar timeout para evitar que se quede colgado
      const timeout = setTimeout(() => {
        console.log('Timeout del escaneo NFC - no se detectó ninguna tarjeta');
        reject(new Error('Tiempo de espera agotado. No se detectó ninguna tarjeta NFC.'));
      }, 30000); // 30 segundos de timeout
      
      // Configurar listener directo para nfcTag
      console.log('Configurando listener directo para nfcTag...');
      
      const tagListener = (data: any) => {
        console.log('=== DATOS NFC RECIBIDOS (DIRECTO) ===');
        console.log('Datos NFC recibidos:', data);
        console.log('Tipo de datos:', typeof data);
        console.log('Estructura de datos:', JSON.stringify(data, null, 2));
        console.log('=====================================');
        
        // Limpiar timeout ya que recibimos datos
        clearTimeout(timeout);
        
        // Extraer UID de los datos del tag
        let uid = null;
        
        // Intentar extraer UID de diferentes ubicaciones
        if (data && data.uid) {
          uid = formatUID(data.uid);
          console.log('UID encontrado en data.uid:', uid);
        } else if (data && data.tagId) {
          uid = formatUID(data.tagId);
          console.log('UID encontrado en data.tagId:', uid);
        } else if (data && data.messages && data.messages.length > 0) {
          // Intentar extraer UID de los mensajes NDEF
          const firstMessage = data.messages[0];
          if (firstMessage && firstMessage.records && firstMessage.records.length > 0) {
            const firstRecord = firstMessage.records[0];
            if (firstRecord && firstRecord.payload) {
              // Decodificar el payload para obtener el UID
              try {
                const decodedPayload = atob(firstRecord.payload);
                uid = formatUID(decodedPayload);
                console.log('UID encontrado en payload decodificado:', uid);
              } catch (e) {
                console.log('Error decodificando payload:', e);
              }
            }
          }
        }
        
        if (uid) {
          console.log('UID detectado (real):', uid);
          // Limpiar listeners antes de resolver
          NFCPlug.removeAllListeners('nfcTag');
          resolve(uid);
        } else {
          console.log('No se pudo extraer UID de los datos NFC');
          console.log('Datos completos recibidos:', data);
          NFCPlug.removeAllListeners('nfcTag');
          reject(new Error('No se pudo leer el UID de la tarjeta NFC'));
        }
      };

      // Configurar listener para errores
      console.log('Configurando listener para nfcError...');
      const errorListener = (error: any) => {
        console.error('Error NFC:', error);
        clearTimeout(timeout);
        NFCPlug.removeAllListeners('nfcError');
        reject(new Error(error.message || 'Error al leer tarjeta NFC'));
      };

      // Registrar los listeners directamente
      NFCPlug.addListener('nfcTag', tagListener);
      NFCPlug.addListener('nfcError', errorListener);

      console.log('Escaneo NFC configurado directamente. Acerca una tarjeta NFC al dispositivo...');

    } catch (error) {
      console.error('Error iniciando escaneo NFC:', error);
      reject(error);
    }
  });
};

// Función para obtener información del dispositivo NFC
export const getNfcInfo = () => {
  return {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    webNfcAvailable: false, // No soportamos Web NFC
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