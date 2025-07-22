@echo off
echo Instalando última versión del APK...

echo.
echo 1. Verificando dispositivos conectados...
adb devices

echo.
echo 2. Verificando que el APK existe...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK encontrado
    for %%A in ("android\app\build\outputs\apk\debug\app-debug.apk") do echo 📏 Tamaño: %%~zA bytes
) else (
    echo ❌ APK no encontrado. Ejecuta build-android.bat primero.
    pause
    exit /b 1
)

echo.
echo 3. Instalando APK...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo ✅ Instalación completada!
echo.
echo 📱 Para abrir la app, busca "Centro Juvenil Don Bosco" en tu dispositivo.
echo 🔍 Para probar el filtro de animadores:
echo    1. Inicia sesión con tus credenciales
echo    2. Ve al módulo "Personas"
echo    3. Cambia el filtro a "Animadores"
echo    4. Deberías ver 11 animadores
echo.
pause 