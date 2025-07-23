import { Capacitor } from '@capacitor/core';

// Importación dinámica para evitar errores de TypeScript
let NFCPlugin: any = null;

// Función para inicializar el plugin
async function initNfcPluginInternal() {
  if (!NFCPlugin) {
    try {
      const { NFC } = await import('@exxili/capacitor-nfc');
      NFCPlugin = NFC;
      console.log('Plugin NFC cargado exitosamente:', NFCPlugin);
      console.log('Métodos disponibles:', Object.getOwnPropertyNames(NFCPlugin));
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

// Función para verificar si NFC está disponible
export const isNfcAvailable = async (): Promise<boolean> => {
  try {
    // En Android, verificar si el plugin está disponible
    if (Capacitor.isNativePlatform()) {
      console.log('Verificando NFC nativo en Android...');
      
      const pluginLoaded = await initNfcPluginInternal();
      if (!pluginLoaded) return false;
      
      // Verificar si el plugin tiene los métodos necesarios
      if (!NFCPlugin) {
        console.log('Plugin NFC no disponible');
        return false;
      }
      
      // Usar isSupported en lugar de isEnabled
      if (typeof NFCPlugin.isSupported === 'function') {
        try {
          const isSupported = await NFCPlugin.isSupported();
          console.log('NFC está soportado:', isSupported);
          return isSupported;
        } catch (error) {
          console.log('Error verificando si NFC está soportado:', error);
          return false;
        }
      } else {
        console.log('Plugin NFC no tiene método isSupported, usando Web NFC');
        return false;
      }
    }
    
    // En web, verificar Web NFC API
    const webNfcAvailable = 'NDEFReader' in window;
    console.log('Web NFC disponible:', webNfcAvailable);
    return webNfcAvailable;
  } catch (error) {
    console.log('Error verificando NFC:', error);
    return false;
  }
};

// Función para extraer UID de diferentes formatos de datos NFC
const extractUidFromNfcData = (data: any): string | null => {
  try {
    console.log('Extrayendo UID de datos NFC:', data);
    
    // Si es un string base64, decodificar
    if (typeof data === 'string') {
      try {
        const decoded = atob(data);
        console.log('Datos decodificados:', decoded);
        
        // Convertir a array de bytes
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          bytes[i] = decoded.charCodeAt(i);
        }
        
        // Extraer UID (primeros 4-8 bytes)
        const uidBytes = bytes.slice(0, Math.min(bytes.length, 8));
        const uid = Array.from(uidBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();
        
        console.log('UID extraído:', uid);
        return uid;
      } catch (error) {
        console.log('Error decodificando base64:', error);
      }
    }
    
    // Si es un ArrayBuffer o DataView
    if (data instanceof ArrayBuffer || data instanceof DataView) {
      const view = data instanceof DataView ? data : new DataView(data);
      const uidBytes = [];
      for (let i = 0; i < Math.min(view.byteLength, 8); i++) {
        uidBytes.push(view.getUint8(i).toString(16).padStart(2, '0'));
      }
      const uid = uidBytes.join('').toUpperCase();
      console.log('UID extraído de ArrayBuffer:', uid);
      return uid;
    }
    
    // Si es un array de números (Uint8Array, Array normal, etc.)
    if (Array.isArray(data) || data instanceof Uint8Array) {
      const array = Array.isArray(data) ? data : Array.from(data);
      console.log('Procesando array de números:', array);
      
      // El UID puede estar invertido, intentar diferentes interpretaciones
      if (array.length >= 4) {
        const interpretations = [
          // Interpretación 1: Normal (primeros bytes)
          array.slice(0, Math.min(array.length, 8)),
          // Interpretación 2: Invertido (últimos bytes primero)
          array.slice(-Math.min(array.length, 8)).reverse(),
          // Interpretación 3: Bytes invertidos individualmente
          array.slice(0, Math.min(array.length, 8)).reverse(),
          // Interpretación 4: Últimos 4 bytes
          array.slice(-4),
          // Interpretación 5: Últimos 4 bytes invertidos
          array.slice(-4).reverse()
        ];
        
        for (let i = 0; i < interpretations.length; i++) {
          const bytes = interpretations[i];
          const uid = bytes
            .map(b => Number(b).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
          
          console.log(`Interpretación ${i + 1}:`, uid);
          
          // Verificar si parece un UID válido (4-8 caracteres hexadecimales)
          if (uid.length >= 4 && uid.length <= 16 && /^[0-9A-F]+$/.test(uid)) {
            console.log('UID válido encontrado:', uid);
            return uid;
          }
        }
      }
      
      // Si ninguna interpretación funcionó, usar la original
      const uidBytes = array.slice(0, Math.min(array.length, 8));
      const uid = uidBytes
        .map(b => Number(b).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      
      console.log('UID extraído de array (original):', uid);
      return uid;
    }
    
    // Si es un objeto con records
    if (data && data.records && Array.isArray(data.records)) {
      for (const record of data.records) {
        if (record.data) {
          const uid = extractUidFromNfcData(record.data);
          if (uid) return uid;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extrayendo UID:', error);
    return null;
  }
};

// Función para buscar el UID real en los datos del plugin
const findRealUid = (result: any): string | null => {
  try {
    console.log('Buscando UID real en datos del plugin:', result);
    
    // Función recursiva para buscar en todas las propiedades
    const searchInObject = (obj: any, path: string = ''): string | null => {
      if (!obj || typeof obj !== 'object') return null;
      
      // Buscar propiedades que podrían contener el UID
      const uidProperties = [
        'uid', 'id', 'serialNumber', 'serial', 'tagId', 'identifier',
        'tag', 'card', 'chip', 'number'
      ];
      
      for (const prop of uidProperties) {
        if (obj[prop] && typeof obj[prop] === 'string') {
          const value = obj[prop].toString().toUpperCase();
          // Verificar si parece un UID válido
          if (value.length >= 4 && /^[0-9A-F:]+$/.test(value)) {
            console.log(`UID encontrado en ${path}.${prop}:`, value);
            return value.replace(/:/g, ''); // Remover dos puntos si los hay
          }
        }
      }
      
      // Buscar en todas las propiedades del objeto
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;
          
          // Si es un string, verificar si parece un UID
          if (typeof value === 'string') {
            const strValue = value.toUpperCase();
            if (strValue.length >= 4 && /^[0-9A-F:]+$/.test(strValue)) {
              console.log(`Posible UID encontrado en ${currentPath}:`, strValue);
              return strValue.replace(/:/g, '');
            }
          }
          
          // Si es un objeto, buscar recursivamente
          if (typeof value === 'object' && value !== null) {
            const found = searchInObject(value, currentPath);
            if (found) return found;
          }
        }
      }
      
      return null;
    };
    
    // Buscar en el objeto result
    let uid = searchInObject(result);
    if (uid) return uid;
    
    // Si no se encontró, intentar con las funciones del plugin
    if (result && typeof result === 'object') {
      const functions = ['base64', 'string', 'uint8Array', 'numberArray'];
      
      for (const funcName of functions) {
        if (typeof result[funcName] === 'function') {
          try {
            const data = result[funcName]();
            console.log(`Explorando datos de ${funcName}:`, data);
            
            // Buscar en los datos devueltos por la función
            uid = searchInObject(data, funcName);
            if (uid) return uid;
            
            // Si los datos tienen estructura messages/records, buscar más profundamente
            if (data && data.messages && Array.isArray(data.messages)) {
              for (let i = 0; i < data.messages.length; i++) {
                const message = data.messages[i];
                uid = searchInObject(message, `${funcName}.messages[${i}]`);
                if (uid) return uid;
                
                // Buscar en records si existen
                if (message.records && Array.isArray(message.records)) {
                  for (let j = 0; j < message.records.length; j++) {
                    const record = message.records[j];
                    uid = searchInObject(record, `${funcName}.messages[${i}].records[${j}]`);
                    if (uid) return uid;
                  }
                }
              }
            }
          } catch (error) {
            console.log(`Error explorando ${funcName}:`, error);
          }
        }
      }
    }
    
    // Si aún no se encontró, intentar interpretar los datos como UID
    // pero solo si parece ser un UID válido (no datos NDEF)
    if (result.messages && result.messages.length > 0) {
      for (const message of result.messages) {
        if (message.records && message.records.length > 0) {
          for (const record of message.records) {
            if (record.payload && Array.isArray(record.payload)) {
              const payload = record.payload;
              console.log('Analizando payload para UID:', payload);
              
              // Verificar si los primeros bytes parecen un UID válido
              if (payload.length >= 4) {
                // Intentar diferentes interpretaciones
                const interpretations = [
                  // Interpretación 1: Primeros 4 bytes
                  payload.slice(0, 4),
                  // Interpretación 2: Últimos 4 bytes
                  payload.slice(-4),
                  // Interpretación 3: Bytes 1-4 (saltando el primer byte)
                  payload.slice(1, 5)
                ];
                
                for (let i = 0; i < interpretations.length; i++) {
                  const bytes = interpretations[i];
                  const uid = bytes
                    .map(b => Number(b).toString(16).padStart(2, '0'))
                    .join('')
                    .toUpperCase();
                  
                  console.log(`Interpretación ${i + 1}:`, uid);
                  
                  // Verificar si parece un UID válido
                  if (uid.length === 8 && /^[0-9A-F]{8}$/.test(uid)) {
                    console.log('UID válido encontrado:', uid);
                    return uid;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error buscando UID real:', error);
    return null;
  }
};

// Función para escanear NFC nativo usando el plugin correcto
export const scanNfcNative = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!Capacitor.isNativePlatform()) {
        reject(new Error('NFC nativo solo está disponible en Android'));
        return;
      }

      console.log('Iniciando escaneo NFC nativo...');
      
      initNfcPluginInternal().then((pluginLoaded) => {
        if (!pluginLoaded || !NFCPlugin) {
          reject(new Error('Plugin NFC no disponible'));
          return;
        }

        console.log('Iniciando escaneo con plugin nativo...');
        
        // Seguir exactamente la documentación de @exxili/capacitor-nfc
        try {
          // En Android, startScan puede no ser necesario, pero lo intentamos
          NFCPlugin.startScan().catch((error: any) => {
            console.log('Error iniciando escaneo NFC (normal en Android):', error);
          });
          
          console.log('Escaneo NFC nativo iniciado correctamente');
          
          // Configurar listener usando la API correcta según la documentación
          NFCPlugin.onRead((data: any) => {
            console.log('NFC detectado por plugin nativo:', data);
            
            try {
              let uid = null;
              
              // Según la documentación, data tiene métodos para acceder a los payloads
              if (data && typeof data === 'object') {
                console.log('Procesando datos NFC nativo...');
                
                // Seguir exactamente el ejemplo de la documentación
                if (typeof data.string === 'function') {
                  try {
                    const stringMessages = data.string();
                    console.log('Datos string del plugin:', stringMessages);
                    
                    // Según la documentación: stringMessages.messages?.at(0)?.records?.at(0).payload
                    if (stringMessages.messages && stringMessages.messages.length > 0) {
                      const firstMessage = stringMessages.messages[0];
                      if (firstMessage.records && firstMessage.records.length > 0) {
                        const firstRecord = firstMessage.records[0];
                        console.log('Primer record encontrado:', firstRecord);
                        
                        // Buscar UID en diferentes propiedades del record
                        if (firstRecord.uid) {
                          uid = firstRecord.uid.toString().toUpperCase();
                          console.log('UID encontrado en record.uid:', uid);
                        } else if (firstRecord.id) {
                          uid = firstRecord.id.toString().toUpperCase();
                          console.log('UID encontrado en record.id:', uid);
                        } else if (firstRecord.serialNumber) {
                          uid = firstRecord.serialNumber.toString().toUpperCase();
                          console.log('UID encontrado en record.serialNumber:', uid);
                        } else if (firstRecord.payload) {
                          // El payload puede contener el UID
                          uid = extractUidFromNfcData(firstRecord.payload);
                          if (uid) {
                            console.log('UID extraído de record.payload:', uid);
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.log('Error obteniendo datos string:', error);
                  }
                }
                
                // Si no se encontró, intentar con uint8Array según la documentación
                if (!uid && typeof data.uint8Array === 'function') {
                  try {
                    const uint8ArrayMessages = data.uint8Array();
                    console.log('Datos uint8Array del plugin:', uint8ArrayMessages);
                    
                    // Según la documentación: uint8ArrayMessages.messages?.at(0)?.records?.at(0).payload
                    if (uint8ArrayMessages.messages && uint8ArrayMessages.messages.length > 0) {
                      const firstMessage = uint8ArrayMessages.messages[0];
                      if (firstMessage.records && firstMessage.records.length > 0) {
                        const firstRecord = firstMessage.records[0];
                        console.log('Primer record uint8Array:', firstRecord);
                        
                        // Buscar UID en diferentes propiedades del record
                        if (firstRecord.uid) {
                          uid = firstRecord.uid.toString().toUpperCase();
                          console.log('UID encontrado en record.uid (uint8Array):', uid);
                        } else if (firstRecord.id) {
                          uid = firstRecord.id.toString().toUpperCase();
                          console.log('UID encontrado en record.id (uint8Array):', uid);
                        } else if (firstRecord.serialNumber) {
                          uid = firstRecord.serialNumber.toString().toUpperCase();
                          console.log('UID encontrado en record.serialNumber (uint8Array):', uid);
                        } else if (firstRecord.payload) {
                          uid = extractUidFromNfcData(firstRecord.payload);
                          if (uid) {
                            console.log('UID extraído de record.payload (uint8Array):', uid);
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.log('Error obteniendo datos uint8Array:', error);
                  }
                }
                
                // Si no se encontró, intentar con numberArray
                if (!uid && typeof data.numberArray === 'function') {
                  try {
                    const numberArrayMessages = data.numberArray();
                    console.log('Datos numberArray del plugin:', numberArrayMessages);
                    
                    if (numberArrayMessages.messages && numberArrayMessages.messages.length > 0) {
                      const firstMessage = numberArrayMessages.messages[0];
                      if (firstMessage.records && firstMessage.records.length > 0) {
                        const firstRecord = firstMessage.records[0];
                        console.log('Primer record numberArray:', firstRecord);
                        
                        // Buscar UID en diferentes propiedades del record
                        if (firstRecord.uid) {
                          uid = firstRecord.uid.toString().toUpperCase();
                          console.log('UID encontrado en record.uid (numberArray):', uid);
                        } else if (firstRecord.id) {
                          uid = firstRecord.id.toString().toUpperCase();
                          console.log('UID encontrado en record.id (numberArray):', uid);
                        } else if (firstRecord.serialNumber) {
                          uid = firstRecord.serialNumber.toString().toUpperCase();
                          console.log('UID encontrado en record.serialNumber (numberArray):', uid);
                        } else if (firstRecord.payload) {
                          uid = extractUidFromNfcData(firstRecord.payload);
                          if (uid) {
                            console.log('UID extraído de record.payload (numberArray):', uid);
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.log('Error obteniendo datos numberArray:', error);
                  }
                }
                
                // Si no se encontró, intentar con base64
                if (!uid && typeof data.base64 === 'function') {
                  try {
                    const base64Messages = data.base64();
                    console.log('Datos base64 del plugin:', base64Messages);
                    
                    if (base64Messages.messages && base64Messages.messages.length > 0) {
                      const firstMessage = base64Messages.messages[0];
                      if (firstMessage.records && firstMessage.records.length > 0) {
                        const firstRecord = firstMessage.records[0];
                        console.log('Primer record base64:', firstRecord);
                        
                        // Buscar UID en diferentes propiedades del record
                        if (firstRecord.uid) {
                          uid = firstRecord.uid.toString().toUpperCase();
                          console.log('UID encontrado en record.uid (base64):', uid);
                        } else if (firstRecord.id) {
                          uid = firstRecord.id.toString().toUpperCase();
                          console.log('UID encontrado en record.id (base64):', uid);
                        } else if (firstRecord.serialNumber) {
                          uid = firstRecord.serialNumber.toString().toUpperCase();
                          console.log('UID encontrado en record.serialNumber (base64):', uid);
                        } else if (firstRecord.payload) {
                          uid = extractUidFromNfcData(firstRecord.payload);
                          if (uid) {
                            console.log('UID extraído de record.payload (base64):', uid);
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.log('Error obteniendo datos base64:', error);
                  }
                }
              }
              
              if (uid && uid.length >= 4) {
                console.log('UID capturado exitosamente con NFC nativo:', uid);
                resolve(uid);
              } else {
                console.log('No se pudo extraer UID válido. Datos disponibles:', data);
                reject(new Error('No se pudo extraer UID válido del tag NFC'));
              }
            } catch (error) {
              console.error('Error procesando datos NFC:', error);
              reject(new Error('Error procesando datos NFC'));
            }
          });

          // Configurar listener para errores
          NFCPlugin.onError((error: any) => {
            console.error('Error en NFC nativo:', error);
            reject(new Error('Error al leer la tarjeta NFC'));
          });
          
          // Timeout para cancelar si no se detecta nada
          setTimeout(() => {
            reject(new Error('Tiempo de espera agotado. Acerca la tarjeta NFC al dispositivo.'));
          }, 15000);

        } catch (error) {
          console.log('Error configurando NFC:', error);
          reject(new Error('Error configurando NFC'));
        }

      }).catch((error) => {
        reject(error);
      });
      
    } catch (error: any) {
      console.error('Error en escaneo NFC nativo:', error);
      reject(new Error('Error al leer la tarjeta NFC'));
    }
  });
};

// Función para escanear NFC usando Web NFC API
export const scanNfcWeb = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!('NDEFReader' in window)) {
        reject(new Error('Web NFC no está disponible en este navegador'));
        return;
      }

      console.log('Iniciando escaneo Web NFC...');
      
      // @ts-ignore - NDEFReader es una API experimental
      const ndef = new (window as any).NDEFReader();
      
      ndef.scan()
        .then(() => {
          console.log('Escaneo Web NFC iniciado correctamente');
          
          ndef.addEventListener('reading', (event: any) => {
            console.log('Evento reading detectado:', event);
            
            // Intentar obtener el UID de diferentes propiedades
            let uid = null;
            
            // 1. Intentar serialNumber
            if (event.serialNumber) {
              uid = event.serialNumber;
              console.log('UID encontrado en serialNumber:', uid);
            }
            
            // 2. Intentar extraer de message.records
            if (!uid && event.message?.records) {
              console.log('Buscando UID en records...');
              for (const record of event.message.records) {
                console.log('Record encontrado:', record);
                
                // Intentar extraer de record.data
                if (record.data) {
                  uid = extractUidFromNfcData(record.data);
                  if (uid) {
                    console.log('UID extraído de record data:', uid);
                    break;
                  }
                }
                
                // Intentar extraer de record.payload
                if (record.payload && !uid) {
                  uid = extractUidFromNfcData(record.payload);
                  if (uid) {
                    console.log('UID extraído de record payload:', uid);
                    break;
                  }
                }
              }
            }
            
            // 3. Intentar extraer de event.data
            if (!uid && event.data) {
              uid = extractUidFromNfcData(event.data);
              if (uid) {
                console.log('UID extraído de event.data:', uid);
              }
            }

            if (uid && uid !== 'unknown' && uid.length >= 4) {
              console.log('UID capturado exitosamente con Web NFC:', uid);
              resolve(uid);
            } else {
              console.log('No se pudo extraer UID válido del evento');
              reject(new Error('Se detectó la tarjeta NFC pero no se pudo leer el UID'));
            }
          });

          ndef.addEventListener('readingerror', (error: any) => {
            console.error('Error de lectura NFC Web:', error);
            reject(new Error('Error al leer la tarjeta NFC'));
          });

          // Timeout para detectar si no se activa NFC
          setTimeout(() => {
            reject(new Error('Tiempo de espera agotado. Acerca la tarjeta NFC al dispositivo.'));
          }, 15000); // Aumentado a 15 segundos

        })
        .catch((error: any) => {
          console.error('Error iniciando Web NFC:', error);
          reject(error);
        });

    } catch (error) {
      console.error('Error en scanNfcWeb:', error);
      reject(error);
    }
  });
};

// Función para escanear NFC (compatibilidad)
export const scanNfcTag = async (): Promise<string> => {
  try {
    // Intentar NFC nativo primero si está disponible
    if (Capacitor.isNativePlatform()) {
      const nativeAvailable = await isNfcAvailable();
      if (nativeAvailable) {
        console.log('Usando NFC nativo...');
        return await scanNfcNative();
      }
    }
    
    // Usar Web NFC como respaldo
    if ('NDEFReader' in window) {
      console.log('Usando Web NFC API...');
      return await scanNfcWeb();
    } else {
      throw new Error('NFC no está disponible en este dispositivo');
    }
  } catch (error) {
    console.error('Error escaneando NFC:', error);
    throw error;
  }
};

// Función para obtener información del dispositivo NFC
export const getNfcInfo = () => {
  const info = {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    webNfcAvailable: 'NDEFReader' in window,
    userAgent: navigator.userAgent,
    https: window.location.protocol === 'https:',
    hostname: window.location.hostname,
    nfcPluginLoaded: !!NFCPlugin,
    nfcPluginMethods: NFCPlugin ? Object.getOwnPropertyNames(NFCPlugin) : []
  };
  
  console.log('Información NFC:', info);
  return info;
};

// Función para inicializar el plugin NFC
export const initNfcPlugin = async (): Promise<boolean> => {
  try {
    console.log('Inicializando NFC...');
    
    // Esperar un poco para que el plugin se cargue
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const available = await isNfcAvailable();
    console.log('NFC inicializado:', available);
    return available;
  } catch (error) {
    console.error('Error inicializando NFC:', error);
    return false;
  }
}; 