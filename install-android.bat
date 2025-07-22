@echo off
echo Instalando APK en dispositivos Android...

echo.
echo 1. Verificando dispositivos conectados...
adb devices

echo.
echo 2. Instalando APK...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo ✅ Instalación completada!
echo.
echo Para abrir la app, busca "Centro Juvenil Don Bosco" en tu dispositivo.
pause 