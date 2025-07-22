# 🔧 Troubleshooting NFC

## 🚨 **Problema Reportado**

**Síntoma**: Al presionar "Vincular NFC" aparece una ventana nativa de Android con:
- Título: "NFC"
- Opción: "Usar NFC" con checkbox
- Botón: "Ajuste"
- Botón: "Listo"

**Problema**: No se captura el UID de la tarjeta NFC.

---

## 🔍 **Diagnóstico**

### **¿Qué está pasando?**
1. Tu dispositivo **SÍ tiene NFC** (por eso aparece la ventana nativa)
2. El navegador **NO está usando la Web NFC API** correctamente
3. Android está mostrando su **interfaz nativa de NFC** en lugar de la Web API

### **Posibles Causas:**
- ✅ NFC está activado en el dispositivo
- ❌ Web NFC API no está disponible en tu navegador
- ❌ La app no está en HTTPS (requerido para NFC)
- ❌ Permisos de NFC no concedidos

---

## 🛠️ **Soluciones**

### **1. Verificar HTTPS**
```javascript
// En la consola del navegador (F12)
console.log('Protocolo:', window.location.protocol);
// Debe mostrar: "https:"
```

### **2. Verificar Web NFC API**
```javascript
// En la consola del navegador (F12)
console.log('NDEFReader disponible:', 'NDEFReader' in window);
// Debe mostrar: true
```

### **3. Verificar Navegador**
- ✅ **Chrome** en Android 8+
- ✅ **Samsung Internet** en Android 8+
- ❌ **Firefox** (no soporta Web NFC)
- ❌ **Safari** (no tiene Web NFC API)

---

## 📱 **Pasos para Probar**

### **Opción 1: Usar Entrada Manual**
1. Presiona "Vincular NFC"
2. Si aparece la ventana nativa, cierra el modal
3. Presiona "Ingresar UID Manualmente"
4. Escribe el código de la tarjeta NFC
5. Presiona "Vincular NFC"

### **Opción 2: Debuggear NFC**
1. Abre la consola del navegador (F12)
2. Presiona "Vincular NFC"
3. Observa los logs en la consola
4. Busca mensajes como:
   - "Iniciando escaneo NFC..."
   - "Evento reading detectado:"
   - "UID encontrado en serialNumber:"

### **Opción 3: Verificar Configuración**
1. **Asegúrate de que NFC esté activado** en tu dispositivo
2. **Usa Chrome** en lugar de otros navegadores
3. **Verifica que la app esté en HTTPS**
4. **Concede permisos** si el navegador los solicita

---

## 🔧 **Mejoras Implementadas**

### **1. Logging Mejorado**
```javascript
console.log('Navegador:', navigator.userAgent);
console.log('HTTPS:', window.location.protocol === 'https:');
console.log('Evento reading detectado:', event);
```

### **2. Timeout de 10 segundos**
- Si no se detecta NFC en 10 segundos, muestra error
- Ofrece opción de entrada manual automáticamente

### **3. Mensajes de Error Específicos**
- Permisos denegados
- NFC no soportado
- Requiere HTTPS
- Timeout de escaneo

### **4. Información de Debugging**
- Muestra información del navegador
- Estado del protocolo (HTTP/HTTPS)
- Soporte de NFC
- Consejos de uso

---

## 📊 **Compatibilidad por Navegador**

| Navegador | Android | Web NFC | Estado |
|-----------|---------|---------|--------|
| Chrome | 8+ | ✅ | Funciona |
| Samsung Internet | 8+ | ✅ | Funciona |
| Firefox | Cualquiera | ❌ | No soportado |
| Safari | iOS | ❌ | No disponible |

---

## 🎯 **Recomendaciones**

### **Para Desarrollo:**
1. **Usa Chrome** en Android para testing
2. **Verifica HTTPS** en producción
3. **Prueba con tarjetas NFC reales**
4. **Revisa logs** en la consola

### **Para Usuarios:**
1. **Activa NFC** en configuración del dispositivo
2. **Usa Chrome** como navegador
3. **Si no funciona, usa entrada manual**
4. **Mantén la tarjeta cerca** por 2-3 segundos

---

## 🚀 **Próximas Mejoras**

- [ ] **Plugin nativo de Capacitor** para NFC
- [ ] **Escáner de códigos QR** como alternativa
- [ ] **Validación de formato UID**
- [ ] **Historial de UIDs usados**

---

**¡La entrada manual siempre está disponible como fallback! 🎉** 