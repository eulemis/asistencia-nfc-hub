// Script de prueba para verificar el login y device_id
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

async function testLogin() {
  try {
    // Simular UUID del dispositivo
    const deviceUUID = 'test-device-uuid-' + Date.now();
    
    console.log('Probando login con UUID:', deviceUUID);
    
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: 'soporte@admin.com',
      password: 'support1234',
      device_name: 'Test Device'
    }, {
      headers: {
        'X-Device-UUID': deviceUUID,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Login exitoso:');
    console.log('Token:', response.data.token ? 'Presente' : 'Ausente');
    console.log('User ID:', response.data.user?.id);
    console.log('Device ID:', response.data.device_id);
    console.log('Device Name:', response.data.device_name);
    
    return {
      token: response.data.token,
      deviceId: response.data.device_id,
      userId: response.data.user?.id,
      deviceUUID: deviceUUID
    };
    
  } catch (error) {
    console.error('Error en login:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Data:', error.response?.data);
    throw error;
  }
}

async function testAsistencia(token, deviceId, deviceUUID) {
  try {
    console.log('\nProbando registro de asistencia...');
    console.log('Device ID:', deviceId);
    console.log('Device UUID:', deviceUUID);
    
    // Formato de fecha compatible con MySQL
    const now = new Date();
    const fechaHora = now.toISOString().slice(0, 19).replace('T', ' ');
    
    const asistenciaData = {
      persona_id: 1, // ID de prueba
      tipo: 'entrada',
      dispositivo_id: deviceId,
      fecha_hora: fechaHora,
      ubicacion: 'Centro Juvenil Don Bosco'
    };
    
    console.log('Datos de asistencia:', asistenciaData);
    
    const response = await axios.post(`${API_BASE_URL}/asistencias`, asistenciaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Device-UUID': deviceUUID,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Asistencia registrada exitosamente:');
    console.log('ID:', response.data.id);
    console.log('Persona ID:', response.data.persona_id);
    console.log('Tipo:', response.data.tipo);
    console.log('Dispositivo ID:', response.data.dispositivo_id);
    
  } catch (error) {
    console.error('Error registrando asistencia:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Errors:', error.response?.data?.errors);
    throw error;
  }
}

async function runTest() {
  try {
    console.log('=== PRUEBA DEL SISTEMA DE ASISTENCIAS ===\n');
    
    // Paso 1: Login
    const loginResult = await testLogin();
    
    // Paso 2: Registrar asistencia
    await testAsistencia(loginResult.token, loginResult.deviceId, loginResult.deviceUUID);
    
    console.log('\n=== PRUEBA COMPLETADA EXITOSAMENTE ===');
    
  } catch (error) {
    console.error('\n=== PRUEBA FALLIDA ===');
    console.error('Error:', error.message);
  }
}

// Ejecutar la prueba
runTest(); 