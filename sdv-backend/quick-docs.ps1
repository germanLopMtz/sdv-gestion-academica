# Script RÁPIDO para generar documentación
# NO compila el proyecto, solo genera docs con archivos existentes

Write-Host "????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "   ? Generador RÁPIDO de Documentación" -ForegroundColor Cyan
Write-Host "????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""
Write-Host "?? Este script NO compila el proyecto" -ForegroundColor Yellow
Write-Host "   Solo genera documentación con archivos existentes" -ForegroundColor Yellow
Write-Host ""

# Verificar DocFX
$docfxVersion = docfx --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "? DocFX no está instalado" -ForegroundColor Red
    Write-Host "?? Instalando..." -ForegroundColor Yellow
    dotnet tool install -g docfx
}

# Ir a docfx_project
Push-Location "docfx_project"

# Limpiar
Write-Host "?? Limpiando archivos anteriores..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "_site", "api", "obj" -ErrorAction SilentlyContinue
Write-Host "? Listo" -ForegroundColor Green
Write-Host ""

# Generar metadatos
Write-Host "?? Extrayendo metadatos..." -ForegroundColor Cyan
docfx metadata docfx.json --warningsAsErrors false 2>$null
Write-Host "? Metadatos extraídos" -ForegroundColor Green
Write-Host ""

# Construir
Write-Host "???  Construyendo sitio..." -ForegroundColor Cyan
docfx build docfx.json --warningsAsErrors false
if ($LASTEXITCODE -eq 0) {
    Write-Host "? ¡Documentación generada!" -ForegroundColor Green
} else {
    Write-Host "??  Generado con advertencias" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "????????????????????????????????????????" -ForegroundColor Green
Write-Host "   ? Documentación lista en:" -ForegroundColor Green
Write-Host "   ?? docfx_project/_site/" -ForegroundColor White
Write-Host "????????????????????????????????????????" -ForegroundColor Green
Write-Host ""

$response = Read-Host "¿Abrir en el navegador? (S/N)"
if ($response -eq 'S' -or $response -eq 's') {
    Write-Host "?? Abriendo http://localhost:9090..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:9090"
    docfx serve _site --port 9090
}

Pop-Location
