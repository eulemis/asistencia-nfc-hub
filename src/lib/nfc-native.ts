import { Capacitor } from '@capacitor/core';

// Importación dinámica para evitar errores de TypeScript
let NFCPlugin: any = null;

// Función para inicializar el plugin
async function initNfcPlugin() {
  if (!NFCPlugin) {
    try {
      const { NFC } = await import('@exxili/capacitor-nfc');
      NFCPlugin = NFC;
    } catch (error) {
      console.error('Error cargando plugin NFC:', error);
      return false;
    }
  }
  return true;
}

export interface NfcTag {
  id: string;
  type: string;
  techTypes?: string[];
  maxSize?: number;
  isWritable?: boolean;
  canMakeReadOnly?: boolean;
}

export async function scanNfcTag(): Promise<string | null> {
  try {
    console.log('Iniciando escaneo NFC nativo...');
    
    // TEMPORAL: Deshabilitar NFC nativo para evitar crashes
    console.log('NFC nativo deshabilitado temporalmente para evitar crashes');
    throw new Error('NFC nativo deshabilitado temporalmente');
    
    // Inicializar el plugin
    const pluginLoaded = await initNfcPlugin();
    if (!pluginLoaded) {
      throw new Error('Plugin NFC no disponible');
    }
    
    // Verificar si NFC está disponible
    const isEnabled = await NFCPlugin.isEnabled();
    if (!isEnabled) {
      console.log('NFC no está habilitado en el dispositivo');
      throw new Error('NFC no está habilitado. Activa NFC en la configuración de tu dispositivo.');
    }

    console.log('NFC está habilitado, iniciando escaneo...');
    
    // Escanear la tarjeta NFC
    const tag: NfcTag = await NFCPlugin.scanTag();
    
    console.log('Tag NFC detectado:', tag);
    
    if (tag && tag.id) {
      console.log('UID capturado exitosamente:', tag.id);
      return tag.id;
    } else {
      console.log('No se pudo obtener el UID del tag NFC');
      return null;
    }
    
  } catch (error: any) {
    console.error('Error en escaneo NFC nativo:', error);
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al leer la tarjeta NFC';
    if (error.message.includes('not enabled')) {
      errorMessage = 'NFC no está habilitado. Activa NFC en la configuración de tu dispositivo.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Tiempo de espera agotado. Acerca la tarjeta NFC al dispositivo.';
    } else if (error.message.includes('permission')) {
      errorMessage = 'Permiso denegado para NFC. Verifica los permisos de la app.';
    }
    
    throw new Error(errorMessage);
  }
}

export async function isNfcSupported(): Promise<boolean> {
  try {
    // TEMPORAL: Retornar false para evitar crashes
    console.log('NFC nativo deshabilitado temporalmente');
    return false;
    
    const pluginLoaded = await initNfcPlugin();
    if (!pluginLoaded) return false;
    
    return await NFCPlugin.isEnabled();
  } catch (error) {
    console.log('NFC no está soportado en este dispositivo');
    return false;
  }
}

export async function isNfcAvailable(): Promise<boolean> {
  try {
    // TEMPORAL: Retornar false para evitar crashes
    console.log('NFC nativo deshabilitado temporalmente');
    return false;
    
    const pluginLoaded = await initNfcPlugin();
    if (!pluginLoaded) return false;
    
    const isSupported = await NFCPlugin.isSupported();
    const isEnabled = await NFCPlugin.isEnabled();
    return isSupported && isEnabled;
  } catch (error) {
    console.log('NFC no está disponible en este dispositivo');
    return false;
  }
} 