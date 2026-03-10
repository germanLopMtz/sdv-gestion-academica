# Guia de inicio

Esta guia te ayudara a configurar y ejecutar el proyecto **SDV Backend** en tu entorno local.

## Requisitos previos

Asegurate de tener instalado:

- **.NET 8 SDK** - [Descargar](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (LocalDB, Express o Full)
- **Visual Studio 2022** o **VS Code** con extension de C#
- **Git** para clonar el repositorio

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/germanLopMtz/sdv-gestion-academica.git
cd sdv-gestion-academica/sdv-backend
```

### 2. Configurar la cadena de conexion

Edita `appsettings.json` con tu configuracion de SQL Server:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SDVAcademicaDB;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

### 3. Aplicar migraciones

```bash
dotnet ef database update
```

Esto creara la base de datos con todas las tablas necesarias.

### 4. Ejecutar el proyecto

```bash
dotnet run
```

La API estara disponible en:
- **HTTP:** `http://localhost:5000`
- **HTTPS:** `https://localhost:5001`
- **Swagger:** `https://localhost:5001/swagger`

## Verificar la instalacion

### Probar con Swagger

1. Navega a `https://localhost:5001/swagger`
2. Expande el endpoint `GET /api/Alumno`
3. Haz clic en "Try it out" -> "Execute"
4. Deberias recibir una respuesta `200 OK` con una lista (puede estar vacia)

### Probar con cURL

```bash
curl -X GET "https://localhost:5001/api/Alumno" -k
```

## Datos de prueba

El sistema incluye **seeding automatico** para:

### Aulas
- Control Room 1
- Control Room 2
- Control Room 3
- Maxiplaza

### Horarios PM
- 3:00-5:00 PM
- 5:30-7:30 PM
- 8:00-10:00 PM

## Endpoints principales

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/Alumno` | Listar alumnos |
| `POST` | `/api/Alumno` | Crear alumno |
| `GET` | `/api/Maestro` | Listar maestros |
| `GET` | `/api/Mensualidad/resumen` | Resumen de pagos |
| `POST` | `/api/Mensualidad` | Registrar pago |

## Solucion de problemas

### Error: "Cannot connect to SQL Server"

**Solucion:** Verifica que SQL Server este ejecutandose:

```bash
# Para LocalDB
sqllocaldb info
sqllocaldb start mssqllocaldb
```

### Error: "The SSL connection could not be established"

**Solucion:** Agrega `TrustServerCertificate=true` a tu cadena de conexion.

### Error: Compilacion falla

**Solucion:** Restaura los paquetes NuGet:

```bash
dotnet restore
dotnet build
```

## Siguiente paso

- Explora la [Arquitectura del sistema](architecture.md)
- Consulta la [documentacion de Mensualidades](mensualidades.md)
- Revisa la [Referencia de API](../api/index.md)
