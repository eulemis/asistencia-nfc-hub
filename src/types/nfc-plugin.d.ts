declare module '@capacitor/core' {
  interface PluginRegistry {
    NfcPlugin: NfcPluginPlugin;
  }
}

export interface NfcPluginPlugin {
  isEnabled(): Promise<{ enabled: boolean }>;
  startScan(): Promise<{ success: boolean; message: string }>;
  stopScan(): Promise<{ success: boolean; message: string }>;
  addListener(eventName: 'nfcTagScanned' | 'nfcError' | 'scanStarted' | 'scanStopped', callback: (data: any) => void): void;
  removeAllListeners(): void;
}

export interface NfcTagData {
  uid: string;
  idBytes: number[];
  techList: string[];
  tagId: string;
  serialNumber: string;
  nfcTag: {
    id: string;
    techTypes: string[];
    type: string;
  };
}

export interface NfcError {
  error: string;
}

export interface NfcScanResult {
  success: boolean;
  message: string;
} 