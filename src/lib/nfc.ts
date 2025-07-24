import { Capacitor } from '@capacitor/core';
import { scanNfcNative, isNfcAvailable } from './nfc-native';

export interface NfcTag {
  id: string;
  techTypes: string[];
  type: string;
}

export interface NfcScanResult {
  success: boolean;
  uid?: string;
  error?: string;
}

export type NfcScanType = 'native';

class NFCManager {
  private _isSupported = false;
  private _isEnabled = false;
  private _nfcAvailable = false;

  constructor() {
    this.checkSupport();
  }

  private async checkSupport() {
    try {
      this._nfcAvailable = await isNfcAvailable();
      this._isSupported = this._nfcAvailable;
      this._isEnabled = this._nfcAvailable;
      console.log('NFC Manager - Soporte verificado:', {
        isSupported: this._isSupported,
        isEnabled: this._isEnabled,
        nfcAvailable: this._nfcAvailable,
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform()
      });
    } catch (error) {
      console.error('Error verificando soporte NFC:', error);
      this._isSupported = false;
      this._isEnabled = false;
    }
  }

  async isSupported(): Promise<boolean> {
    return this._isSupported;
  }

  async isEnabled(): Promise<boolean> {
    return this._isEnabled;
  }

  async startScan(scanType: NfcScanType = 'native'): Promise<NfcScanResult> {
    if (!this._isSupported || !this._isEnabled) {
      return {
        success: false,
        error: 'NFC no está soportado o habilitado'
      };
    }

    try {
      console.log(`Iniciando escaneo NFC con tipo: ${scanType}`);
      
      let uid: string;
      
      if (scanType === 'native') {
        // Usar plugin nativo para Android
        uid = await scanNfcNative();
      } else {
        throw new Error('Tipo de escaneo no soportado');
      }
      
      console.log('UID capturado exitosamente:', uid);
      
      return {
        success: true,
        uid: uid
      };
      
    } catch (error: any) {
      console.error('Error en escaneo NFC:', error);
      return {
        success: false,
        error: error.message || 'Error al escanear tarjeta NFC'
      };
    }
  }

  async stopScan(): Promise<void> {
    // En Capacitor, aquí se detendría el escaneo real
    console.log('NFC scan stopped');
  }

  // Para pruebas, permitir especificar un UID
  async scanWithUID(uid: string): Promise<NfcScanResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          uid: uid
        });
      }, 1000);
    });
  }

  getNfcInfo() {
    return {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      isSupported: this._isSupported,
      isEnabled: this._isEnabled,
      nfcAvailable: this._nfcAvailable
    };
  }
}

// Exportar una instancia singleton
export const nfcManager = new NFCManager();