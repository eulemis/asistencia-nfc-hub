// Simulación de NFC para web - En producción se usará @capacitor-community/nfc
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

class NFCManager {
  private _isSupported = false;
  private _isEnabled = false;

  constructor() {
    // En web, simulamos el comportamiento NFC
    this.checkSupport();
  }

  private checkSupport() {
    // Simulación para web - En Capacitor sería diferente
    this._isSupported = true;
    this._isEnabled = true;
  }

  async isSupported(): Promise<boolean> {
    return this._isSupported;
  }

  async isEnabled(): Promise<boolean> {
    return this._isEnabled;
  }

  async startScan(): Promise<NfcScanResult> {
    if (!this._isSupported || !this._isEnabled) {
      return {
        success: false,
        error: 'NFC no está soportado o habilitado'
      };
    }

    // Simulación de escaneo NFC para desarrollo web
    return new Promise((resolve) => {
      // Simular tiempo de escaneo
      setTimeout(() => {
        // Generar UID simulado para pruebas
        const simulatedUID = this.generateSimulatedUID();
        resolve({
          success: true,
          uid: simulatedUID
        });
      }, 2000);
    });
  }

  async stopScan(): Promise<void> {
    // En Capacitor, aquí se detendría el escaneo real
    console.log('NFC scan stopped');
  }

  private generateSimulatedUID(): string {
    // Generar UID simulado para pruebas (formato típico de tarjetas NFC)
    const chars = '0123456789ABCDEF';
    let uid = '';
    for (let i = 0; i < 8; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
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
}

export const nfcManager = new NFCManager();