import { registerPlugin } from '@capacitor/core';

export interface NfcUidResult {
  uid: string;
}

export interface NfcUidPlugin {
  startReading(): Promise<NfcUidResult>;
  stopReading(): Promise<void>;
}

const NfcUidReader = registerPlugin<NfcUidPlugin>('NfcUidReader');

export default NfcUidReader;
