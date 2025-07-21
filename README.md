# Centro Juvenil Don Bosco - Sistema de Asistencia NFC

Sistema móvil para gestión de asistencia mediante tarjetas NFC en el Centro Juvenil Don Bosco.

## Características

- **Autenticación con Sanctum**: Login y registro seguro con tokens JWT
- **Gestión de dispositivos**: Registro automático de UUID de dispositivos
- **Listado de personas**: Filtrado por tipo y edad
- **Asociación NFC**: Vincular tarjetas NFC a personas registradas
- **Escaneo NFC**: Registrar entrada/salida mediante tarjetas NFC
- **Validaciones de seguridad**: Solo funciona con usuarios logueados y dispositivos autorizados

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Capacitor (para funcionalidades nativas)
- Axios para comunicación con API
- React Router para navegación

## API Endpoints

La aplicación se conecta a la API en: `https://centrojuvenildonbosco.org/api`

### Autenticación
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario
- `GET /me` - Obtener datos del usuario actual
- `POST /logout` - Cerrar sesión

### Dispositivos
- `POST /devices/register` - Registrar dispositivo
- `GET /devices` - Listar dispositivos
- `POST /devices/{id}/deactivate` - Desactivar dispositivo

### Funcionalidades principales (requieren autenticación y dispositivo autorizado)
- `GET /personas` - Listar personas
- `POST /personas/{id}/asociar-nfc` - Asociar tarjeta NFC
- `GET /nfc/{uid}` - Consultar tarjeta NFC
- `POST /asistencias` - Registrar asistencia

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## Generar APK para Android

1. **Exportar proyecto a GitHub**
   - Usar el botón "Export to Github" en Lovable
   - Clonar el repositorio en tu máquina local

2. **Configurar Capacitor**
   ```bash
   npm install
   npx cap init
   npx cap add android
   npx cap update android
   ```

3. **Construir y sincronizar**
   ```bash
   npm run build
   npx cap sync
   ```

4. **Generar APK**
   ```bash
   npx cap run android
   ```
   Esto abrirá Android Studio donde podrás generar el APK.

## Funcionalidades NFC

Para desarrollo web, el sistema simula el comportamiento NFC. En dispositivos móviles con Capacitor, se integra con `@capacitor-community/nfc` para funcionalidad NFC real.

### Flujo de uso:
1. **Login/Registro**: Usuario se autentica en el sistema
2. **Asociar NFC**: Escanear tarjeta y asociarla a una persona
3. **Registrar asistencia**: Escanear tarjeta para marcar entrada/salida

## Seguridad

- Tokens JWT para autenticación
- UUID único por dispositivo
- Validación de dispositivos autorizados
- Headers de seguridad en todas las requests (`X-Device-UUID`)

---

Desarrollado para el Centro Juvenil Don Bosco
