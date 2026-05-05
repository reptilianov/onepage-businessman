$ErrorActionPreference = "Continue"
$PROJECT_ROOT = "H:\docker1\alberto"
$PORT = 4321

Set-Location $PROJECT_ROOT

# 1. Check if already running
$connection = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue
$astroProcess = Get-CimInstance Win32_Process | Where-Object { $_.Name -match "node.exe" -and $_.CommandLine -match "astro" }

if ($connection -or $astroProcess) {
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "  ESTADO: ENCENDIDO -> APAGANDO..." -ForegroundColor Red
    Write-Host "=======================================================================" -ForegroundColor Cyan

    cmd.exe /c "taskkill /F /FI `"WINDOWTITLE eq ASTRO*`" /T >nul 2>&1"
    cmd.exe /c "taskkill /F /FI `"WINDOWTITLE eq SoyBogart*`" /T >nul 2>&1"

    if ($astroProcess) {
        $astroProcess | Invoke-CimMethod -MethodName Terminate | Out-Null
    }

    $stuck = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue
    if ($stuck) {
        $stuck | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            if ($_ -ne 0) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
        }
    }

    Write-Host "`n   ✅ Servidor apagado.`n" -ForegroundColor Green
    Start-Sleep -Seconds 2
    exit 0
}

# 2. Start
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SOYBOGART - ASTRO DEV SERVER" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$PROJECT_ROOT\node_modules")) {
    Write-Host "[1/2] Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[1/2] ✅ Dependencias listas." -ForegroundColor Green
}
Write-Host ""

Write-Host "[2/2] Iniciando servidor Astro..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k TITLE ASTRO SERVER && echo Servidor Astro corriendo en http://localhost:$PORT && npm run dev" -WindowStyle Normal
Write-Host ""

Write-Host "   🌐 http://localhost:$PORT" -ForegroundColor Cyan
Write-Host "   💡 Vuelve a ejecutar dev.bat para APAGARLO." -ForegroundColor Gray
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:$PORT"