# 🔍 Test Filtro Animadores

## 📱 **APK Compilado y Listo**

✅ **APK generado**: `android\app\build\outputs\apk\debug\app-debug.apk` (5.3 MB)
✅ **Fecha**: 22/7/2025 2:08 a.m.
✅ **Estado**: Listo para instalar

## 🚀 **Instrucciones de Instalación**

### **Opción 1: Script Automático**
```bash
# Conectar dispositivo Android via USB
# Habilitar depuración USB
# Ejecutar:
install-latest.bat
```

### **Opción 2: Comandos Manuales**
```bash
# 1. Verificar dispositivo conectado
adb devices

# 2. Instalar APK
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

## 🧪 **Pasos para Probar el Filtro de Animadores**

### **1. Instalar la App**
- Conectar dispositivo Android
- Ejecutar `install-latest.bat`
- Buscar "Centro Juvenil Don Bosco" en el dispositivo

### **2. Iniciar Sesión**
- Usar credenciales válidas
- Verificar que el dispositivo esté autorizado

### **3. Probar Filtro de Animadores**
1. **Ir al módulo "Personas"**
2. **Cambiar filtro** de "Niños" a "Animadores"
3. **Verificar resultados**:
   - ✅ Deberían aparecer **11 animadores**
   - ✅ Nombres como: Diego Rodríguez, María Avile, etc.
   - ✅ Edades entre 18-24 años

### **4. Debuggear si no funciona**
- **Abrir consola del navegador** (F12 en la app)
- **Verificar logs** cuando cambies el filtro
- **Buscar errores** de autenticación o red

## 🔧 **Debugging**

### **Logs esperados en consola:**
```
Cambiando filtro de tipo: animador
Filtros cambiados: {filtroTipo: "animador", ...}
URL de la petición: /personas?tipo=animador&page=1
Respuesta del servidor: {total: 11, ...}
```

### **Posibles errores:**
- **Error 401**: Problema de autenticación
- **Error 403**: Dispositivo no autorizado
- **Error 500**: Problema del servidor
- **Sin resultados**: Verificar logs del backend

## 📊 **Datos de Prueba**

### **Animadores en BD (11 total):**
1. Diego Rodríguez (18 años)
2. María Avile (18 años)
3. Jhonaiker Gómez (24 años)
4. Michel Belisario (18 años)
5. Juan Noda (19 años)
6. Samuel Perez (19 años)
7. Shantal Castillo (20 años)
8. Juan Zerpa (18 años)
9. Jesús Gómez (18 años)
10. Yerman Durán (19 años)
11. Keninyer Reyes (19 años)

## 🐛 **Solución de Problemas**

### **Si no aparecen animadores:**
1. **Verificar autenticación** - Inicia sesión correctamente
2. **Verificar dispositivo** - Asegúrate de que esté autorizado
3. **Revisar logs** - Abre la consola del navegador
4. **Probar endpoint** - Usa el archivo HTML de test

### **Si hay errores de red:**
1. **Verificar conexión** - Asegúrate de tener internet
2. **Verificar URL** - La app debe apuntar a producción
3. **Limpiar cache** - Reinicia la app

## 📞 **Soporte**

Si el problema persiste:
1. **Compartir logs** de la consola del navegador
2. **Compartir captura** de la pantalla de error
3. **Verificar** que el dispositivo esté autorizado
4. **Probar** con el archivo HTML de test

---

**¡El APK está listo para probar! 🎉** 