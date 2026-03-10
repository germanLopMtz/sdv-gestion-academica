# Script para generar documentación con DocFX
# Autor: SDV Team
# Descripción: Automatiza la generación de documentación del proyecto

Write-Host "????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "   ?? Generador de Documentación SDV" -ForegroundColor Cyan
Write-Host "????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""

# Verificar que DocFX esté instalado
Write-Host "?? Verificando instalación de DocFX..." -ForegroundColor Yellow
$docfxVersion = docfx --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "? DocFX no está instalado" -ForegroundColor Red
    Write-Host "?? Instalando DocFX..." -ForegroundColor Yellow
    dotnet tool install -g docfx
    if ($LASTEXITCODE -ne 0) {
        Write-Host "? Error al instalar DocFX" -ForegroundColor Red
        exit 1
    }
    Write-Host "? DocFX instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "? DocFX ya está instalado: $docfxVersion" -ForegroundColor Green
}

Write-Host ""

# Intentar compilar solo si no está en uso
Write-Host "?? Verificando si el proyecto está disponible para compilar..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "sdv-backend"
$exePath = Join-Path $backendPath "bin\Release\net8.0\sdv-backend.exe"

# Verificar si el proceso está corriendo
$processRunning = Get-Process | Where-Object {$_.ProcessName -like "*sdv-backend*"}

if ($processRunning) {
    Write-Host "??  El backend está en ejecución. Saltando compilación..." -ForegroundColor Yellow
    Write-Host "?? Usando archivos XML existentes" -ForegroundColor Cyan
} else {
    Write-Host "?? Compilando proyecto backend..." -ForegroundColor Cyan
    Push-Location $backendPath
    
    # Compilar sin bloquear archivos
    dotnet build --configuration Release --verbosity quiet --no-incremental
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "??  Advertencia: No se pudo compilar el proyecto" -ForegroundColor Yellow
        Write-Host "?? Continuando con archivos XML existentes..." -ForegroundColor Cyan
    } else {
        Write-Host "? Proyecto compilado exitosamente" -ForegroundColor Green
    }
    
    Pop-Location
}

Write-Host ""

# Cambiar al directorio de DocFX
Write-Host "?? Accediendo a directorio de documentación..." -ForegroundColor Yellow
Push-Location "docfx_project"

# Limpiar archivos anteriores
Write-Host "?? Limpiando archivos anteriores..." -ForegroundColor Yellow
if (Test-Path "_site") {
    Remove-Item -Recurse -Force "_site" -ErrorAction SilentlyContinue
}
if (Test-Path "api") {
    Remove-Item -Recurse -Force "api" -ErrorAction SilentlyContinue
}
if (Test-Path "obj") {
    Remove-Item -Recurse -Force "obj" -ErrorAction SilentlyContinue
}
Write-Host "? Limpieza completada" -ForegroundColor Green

Write-Host ""

# Extraer metadatos
Write-Host "?? Extrayendo metadatos del código..." -ForegroundColor Cyan
docfx metadata docfx.json --warningsAsErrors false
if ($LASTEXITCODE -ne 0) {
    Write-Host "??  Advertencia al extraer metadatos" -ForegroundColor Yellow
    Write-Host "?? Continuando con la construcción..." -ForegroundColor Cyan
} else {
    Write-Host "? Metadatos extraídos correctamente" -ForegroundColor Green
}

Write-Host ""

# Construir sitio de documentación
Write-Host "???  Construyendo sitio de documentación..." -ForegroundColor Cyan
docfx build docfx.json --warningsAsErrors false
if ($LASTEXITCODE -ne 0) {
    Write-Host "? Error al construir la documentación" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "? Documentación generada exitosamente" -ForegroundColor Green

Write-Host ""
Write-Host "????????????????????????????????????????" -ForegroundColor Green
Write-Host "   ? Documentación generada en:" -ForegroundColor Green
Write-Host "   ?? docfx_project/_site/" -ForegroundColor White
Write-Host "????????????????????????????????????????" -ForegroundColor Green
Write-Host ""

# Preguntar si desea abrir el servidor local
$response = Read-Host "¿Desea iniciar el servidor local para ver la documentación? (S/N)"
if ($response -eq 'S' -or $response -eq 's') {
    Write-Host ""
    Write-Host "?? Iniciando servidor local..." -ForegroundColor Cyan
    Write-Host "?? Documentación disponible en: http://localhost:9090" -ForegroundColor Yellow
    Write-Host "??  Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "?? Nota: Tu frontend seguirá funcionando en puerto 8080" -ForegroundColor Magenta
    Write-Host ""
    
    # Abrir navegador automáticamente
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:9090"
    
    docfx serve _site --port 9090
}

Pop-Location
Write-Host ""
Write-Host "?? ¡Gracias por usar el generador de documentación SDV!" -ForegroundColor Cyan
