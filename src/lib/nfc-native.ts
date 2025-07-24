import { Capacitor } from '@capacitor/core';
import { NFC, NDEFMessagesTransformable, NFCError } from '@exxili/capacitor-nfc';

// Función para verificar si estamos en plataforma nativa
function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export interface NfcTag {
  id: string;
  type: string;
  techTypes?: string[];
  maxSize?: number;
  isWritable?: boolean;
  canMakeReadOnly?: boolean;
}

// Variable para almacenar el UID cuando se detecte
let lastDetectedUid: string | null = null;
let isCurrentlyScanning = false;

export async function scanNfcTag(): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Iniciando escaneo NFC nativo...');
      
      // Verificar si estamos en plataforma nativa
      if (!isNativePlatform()) {
        console.log('No estamos en plataforma nativa');
        reject(new Error('NFC nativo solo está disponible en plataformas móviles'));
        return;
      }
      
      // Verificar si NFC está soportado
      const isSupported = await NFC.isSupported();
      if (!isSupported.supported) {
        console.log('NFC no está soportado en este dispositivo');
        reject(new Error('NFC no está soportado en este dispositivo'));
        return;
      }

      console.log('NFC está soportado, iniciando escaneo...');
      
      // Configurar listeners antes de iniciar el escaneo
      let readListener: any = null;
      let errorListener: any = null;
      let timeoutId: any = null;

      // Cleanup function
      const cleanup = () => {
        if (readListener) {
          readListener.remove();
        }
        if (errorListener) {
          errorListener.remove();
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        isCurrentlyScanning = false;
      };

      // Configurar timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Tiempo de espera agotado. Acerca la tarjeta NFC al dispositivo.'));
      }, 15000); // 15 segundos de timeout

      // Listener para errores
      errorListener = NFC.onError((error: NFCError) => {
        console.error('Error NFC detectado:', error);
        cleanup();
        
        let errorMessage = 'Error al leer la tarjeta NFC';
        if (error.error.includes('not enabled') || error.error.includes('disabled')) {
          errorMessage = 'NFC no está habilitado. Activa NFC en la configuración de tu dispositivo.';
        } else if (error.error.includes('permission')) {
          errorMessage = 'Permiso denegado para NFC. Verifica los permisos de la app.';
        } else if (error.error.includes('cancelled') || error.error.includes('user')) {
          errorMessage = 'Escaneo cancelado por el usuario.';
        }
        
        reject(new Error(errorMessage));
      });

      // Listener para lectura exitosa
      readListener = NFC.onRead((data: NDEFMessagesTransformable) => {
        console.log('Datos NFC recibidos:', data);
        
        // Intentar extraer el UID de diferentes formas
        let uid: string | null = null;
        
        try {
          // Método 1: Verificar si los datos tienen información del tag
          const rawData = data as any;
          console.log('Datos raw del NFC:', rawData);
          
          // El UID físico podría estar en diferentes propiedades
          if (rawData.uid) {
            uid = rawData.uid;
            console.log('UID encontrado en rawData.uid:', uid);
          } else if (rawData.id) {
            uid = rawData.id;
            console.log('UID encontrado en rawData.id:', uid);
          } else if (rawData.serialNumber) {
            uid = rawData.serialNumber;
            console.log('UID encontrado en rawData.serialNumber:', uid);
          } else if (rawData.tagId) {
            uid = rawData.tagId;
            console.log('UID encontrado en rawData.tagId:', uid);
          }
          
          // Método 2: Buscar en los mensajes NDEF
          if (!uid) {
            const messages = data.uint8Array();
            console.log('Mensajes NDEF:', messages);
            
            if (messages && messages.messages && messages.messages.length > 0) {
              // Intentar extraer información de identificación de los records
              for (const message of messages.messages) {
                if (message.records && message.records.length > 0) {
                  for (const record of message.records) {
                    console.log('Record encontrado:', record);
                    // Si es un record de texto, podría contener información útil
                    if (record.type === 'T' && record.payload) {
                      console.log('Record de texto encontrado con payload:', record.payload);
                    }
                  }
                }
              }
            }
          }
          
          // Método 3: Si no encontramos UID, intentar generar uno basado en los datos
          if (!uid && data) {
            // Como último recurso, generar un hash de los datos recibidos
            const dataString = JSON.stringify(data);
            uid = generateHashFromString(dataString);
            console.log('UID generado a partir de datos:', uid);
          }
          
        } catch (error) {
          console.error('Error procesando datos NFC:', error);
        }
        
        if (uid && uid !== 'unknown') {
          // Asegurar formato hexadecimal en mayúsculas
          uid = uid.toString().replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
          
          if (uid.length > 0) {
            console.log('UID capturado exitosamente:', uid);
            lastDetectedUid = uid;
            cleanup();
            resolve(uid);
          } else {
            console.log('UID vacío después del procesamiento');
            cleanup();
            reject(new Error('Se detectó la tarjeta NFC pero no se pudo obtener un UID válido. El UID puede estar en formato no estándar.'));
          }
        } else {
          console.log('No se pudo extraer UID válido de los datos NFC');
          cleanup();
          reject(new Error('Se detectó la tarjeta NFC pero no se pudo leer el UID. Verifica que la tarjeta sea compatible.'));
        }
      });

      // Marcar que estamos escaneando
      isCurrentlyScanning = true;
      
      // Iniciar el escaneo
      console.log('Iniciando startScan...');
      await NFC.startScan();
      console.log('Escaneo NFC iniciado correctamente, esperando tarjeta...');
      
    } catch (error: any) {
      console.error('Error iniciando escaneo NFC:', error);
      isCurrentlyScanning = false;
      
      let errorMessage = 'Error al iniciar el escáner NFC';
      if (error.message.includes('not supported')) {
        errorMessage = 'NFC no está soportado en este dispositivo.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permiso denegado para NFC. Verifica los permisos de la app.';
      }
      
      reject(new Error(errorMessage));
    }
  });
}

// Función auxiliar para generar hash simple
function generateHashFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export async function isNfcSupported(): Promise<boolean> {
  try {
    if (!isNativePlatform()) {
      return false;
    }
    
    const result = await NFC.isSupported();
    return result.supported;
  } catch (error) {
    console.log('Error verificando soporte NFC:', error);
    return false;
  }
}

export async function isNfcAvailable(): Promise<boolean> {
  try {
    if (!isNativePlatform()) {
      return false;
    }
    
    const isSupported = await NFC.isSupported();
    if (!isSupported.supported) {
      return false;
    }
    
    // Este plugin no tiene un método isEnabled, asumimos que si está soportado, está disponible
    return true;
  } catch (error) {
    console.log('Error verificando disponibilidad NFC:', error);
    return false;
  }
}

// Función para cancelar escaneo en curso
export async function cancelNfcScan(): Promise<void> {
  try {
    if (isCurrentlyScanning && isNativePlatform()) {
      // Este plugin no parece tener un método específico para cancelar en iOS
      // pero podemos marcar que ya no estamos escaneando
      isCurrentlyScanning = false;
      console.log('Escaneo NFC cancelado');
    }
  } catch (error) {
    console.error('Error cancelando escaneo NFC:', error);
  }
}