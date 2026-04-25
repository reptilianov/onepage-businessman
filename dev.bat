@echo off
echo Iniciando servidor de desarrollo...
start http://localhost:4321
timeout /t 3 /nobreak >nul
start http://localhost:4321