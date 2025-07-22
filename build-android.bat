@echo off
echo Compilando proyecto Android...

echo.
echo 1. Sincronizando Capacitor...
npx cap sync android

echo.
echo 2. Compilando con Gradle...
cd android
.\gradlew assembleDebug

echo.
echo 3. Verificando APK generado...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK generado exitosamente!
    echo 📱 Archivo: app\build\outputs\apk\debug\app-debug.apk
    echo 📏 Tamaño: 
    for %%A in ("app\build\outputs\apk\debug\app-debug.apk") do echo    %%~zA bytes
) else (
    echo ❌ Error: No se generó el APK
)

echo.
echo 4. Verificando dispositivos conectados...
adb devices

echo.
echo ✅ Compilación completada!
pause 