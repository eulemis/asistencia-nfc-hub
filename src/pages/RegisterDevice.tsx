import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Smartphone, ArrowLeft } from 'lucide-react';
import { getDeviceUUID } from '@/lib/axios';
import api from '@/lib/axios';

const RegisterDevice: React.FC = () => {
  const [uuid, setUuid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUuid, setIsLoadingUuid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUuid = async () => {
      try {
        const deviceUuid = await getDeviceUUID();
        setUuid(deviceUuid);
      } catch (error) {
        console.error('Error loading device UUID:', error);
      } finally {
        setIsLoadingUuid(false);
      }
    };
    loadUuid();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/devices/register', {
        uuid,
        device_name: deviceName,
        email,
        password
      });
      
      // Redirigir al login después del registro exitoso
      navigate('/login', { 
        state: { message: 'Dispositivo registrado exitosamente. Ya puedes iniciar sesión.' }
      });
    } catch (error: any) {
      console.error('Error registering device:', error);
      
      // Mostrar información detallada del error
      let errorMessage = 'Error al registrar el dispositivo';
      
      if (error.response) {
        // Error de respuesta del servidor
        console.log('Error response:', error.response);
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        
        errorMessage = error.response.data?.message || errorMessage;
        
        if (error.response.status === 422) {
          errorMessage = 'Datos inválidos: ' + (error.response.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : '');
        } else if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (error.response.status === 409) {
          errorMessage = 'Este dispositivo ya está registrado';
        }
      } else if (error.request) {
        // Error de red
        console.log('Network error:', error.request);
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else {
        // Otro tipo de error
        console.log('Other error:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con imagen */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/fondo70.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Logo centrado */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <img 
          src="/logo70.png" 
          alt="Centro Juvenil Don Bosco" 
          className="max-w-[700px] w-[40vw] min-w-[200px] drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
        />
      </div>

      {/* Formulario de registro */}
      <div className="relative z-20 w-full max-w-md">
        <Card className="bg-yellow-400/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Smartphone className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Registrar Dispositivo</CardTitle>
            <CardDescription className="text-gray-700">
              Registra este dispositivo para poder usar la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="uuid" className="text-gray-800 font-semibold">UUID del Dispositivo</Label>
                <Input
                  id="uuid"
                  type="text"
                  value={uuid}
                  disabled
                  placeholder={isLoadingUuid ? "Cargando..." : "UUID del dispositivo"}
                  className="bg-white/90 border-0 rounded-lg h-12 text-lg"
                />
                <p className="text-xs text-gray-600">
                  Este identificador es único para tu dispositivo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceName" className="text-gray-800 font-semibold">Nombre del Dispositivo</Label>
                <Input
                  id="deviceName"
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                  placeholder="Ej: Samsung Galaxy S21"
                  className="bg-white/90 border-0 rounded-lg h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-semibold">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="bg-white/90 border-0 rounded-lg h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 font-semibold">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Tu contraseña"
                  className="bg-white/90 border-0 rounded-lg h-12 text-lg"
                />
                <p className="text-xs text-gray-600">
                  Para verificar que eres un usuario autorizado
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg" 
                disabled={isLoading || isLoadingUuid}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Smartphone className="w-5 h-5 mr-2" />
                )}
                Registrar Dispositivo
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-700 hover:text-orange-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterDevice; 