import React, { useState } from 'react';
import { Alert, Button, View, Text, StyleSheet } from 'react-native';
// @ts-ignore
import NfcUidReader from 'capacitor-nfc-uid-reader';

const NfcReader: React.FC = () => {
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const readUID = async () => {
    setLoading(true);
    setError('');
    setUid('');
    try {
      const { uid } = await NfcUidReader.startReading();
      setUid(uid);
      Alert.alert('UID NFC detectado', uid);
    } catch (err: any) {
      setError(err?.message || String(err));
      Alert.alert('Error al leer NFC', err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const stopReading = async () => {
    try {
      await NfcUidReader.stopReading();
    } catch {}
  };

  React.useEffect(() => {
    return () => {
      stopReading();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Button title={loading ? 'Leyendo NFC...' : 'Leer NFC UID'} onPress={readUID} disabled={loading} />
      {uid ? <Text style={styles.uid}>UID detectado: {uid}</Text> : null}
      {error ? <Text style={styles.error}>Error: {error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  uid: { marginTop: 16, fontWeight: 'bold', color: 'green' },
  error: { marginTop: 16, color: 'red' },
});

export default NfcReader;
