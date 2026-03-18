# =============================================================
# Script de análisis con SonarQube para sdv-backend
# Uso: .\sonar-scan.ps1 -Token "tu_token_aqui"
# =============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [string]$SonarUrl = "http://localhost:9000",
    [string]$ProjectKey = "sdv-backend"
)

Write-Host "Iniciando análisis SonarQube para $ProjectKey..." -ForegroundColor Cyan

# Limpiar carpeta .sonarqube para evitar conflictos con OneDrive
$sonarDir = ".sonarqube"
if (Test-Path $sonarDir) {
    Write-Host "Limpiando carpeta .sonarqube anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $sonarDir -ErrorAction SilentlyContinue
}

# Crear carpeta y excluirla de OneDrive (atributo FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS)
New-Item -ItemType Directory -Force -Path $sonarDir | Out-Null
attrib +P "$sonarDir" /S /D 2>$null

# Paso 1: Iniciar el scanner
dotnet sonarscanner begin `
    /k:"$ProjectKey" `
    /d:sonar.host.url="$SonarUrl" `
    /d:sonar.token="$Token" `
    /d:sonar.cs.opencover.reportsPaths="**/coverage.opencover.xml" `
    /d:sonar.exclusions="**/Migrations/**,**/obj/**,**/bin/**"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al iniciar el scanner." -ForegroundColor Red
    exit 1
}

# Paso 2: Compilar el proyecto
dotnet build --no-incremental

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la compilación." -ForegroundColor Red
    exit 1
}

# Paso 3: Finalizar y enviar resultados a SonarQube
dotnet sonarscanner end /d:sonar.token="$Token"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al finalizar el scanner." -ForegroundColor Red
    exit 1
}

Write-Host "Análisis completado. Revisa los resultados en: $SonarUrl/dashboard?id=$ProjectKey" -ForegroundColor Green
