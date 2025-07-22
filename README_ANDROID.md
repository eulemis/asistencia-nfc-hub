# 📱 Compilación e Instalación Android

## 🚀 Compilación Rápida

### Opción 1: Script Automático
```bash
# Ejecutar el script de compilación
build-android.bat
```

### Opción 2: Comandos Manuales
```bash
# 1. Sincronizar Capacitor
npx cap sync android

# 2. Compilar con Gradle
cd android
.\gradlew assembleDebug
```

## 📲 Instalación en Dispositivo

### Opción 1: Script Automático
```bash
# Ejecutar el script de instalación
install-android.bat
```

### Opción 2: Comandos Manuales
```bash
# 1. Conectar dispositivo via USB y habilitar depuración
adb devices

# 2. Instalar APK
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

## 🔧 Configuración del Dispositivo

### Habilitar Depuración USB
1. Ir a **Configuración** > **Acerca del teléfono**
2. Tocar **Número de compilación** 7 veces
3. Ir a **Configuración** > **Opciones de desarrollador**
4. Activar **Depuración USB**

### Conectar Dispositivo
1. Conectar dispositivo via USB
2. Permitir depuración USB en el dispositivo
3. Verificar conexión: `adb devices`

## 📁 Archivos Generados

- **APK**: `android\app\build\outputs\apk\debug\app-debug.apk`
- **Tamaño**: ~5.3 MB
- **Nombre**: Centro Juvenil Don Bosco

## 🐛 Solución de Problemas

### Error: "Missing options for android signing"
- ✅ **Solucionado**: Se configuró keystore de debug

### Error: "invalid source release: 21"
- ✅ **Solucionado**: Se cambió a Java 17

### No se detecta dispositivo
1. Verificar cable USB
2. Habilitar depuración USB
3. Instalar drivers del dispositivo

## 🎯 Próximos Pasos

1. **Conectar dispositivo Android**
2. **Ejecutar**: `build-android.bat`
3. **Ejecutar**: `install-android.bat`
4. **Probar funcionalidades**:
   - Login con credenciales
   - Registro de dispositivo
   - Módulo de Personas
   - Módulo de Asistencias

## 📞 Soporte

Si encuentras problemas:
1. Verificar que Android Studio esté instalado
2. Verificar que JAVA_HOME esté configurado
3. Verificar que el dispositivo esté conectado correctamente 