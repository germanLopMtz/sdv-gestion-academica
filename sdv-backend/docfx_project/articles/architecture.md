# Arquitectura del sistema

Esta guia explica la arquitectura y patrones de diseno utilizados en **SDV Backend**.

## Arquitectura general

El proyecto sigue una **arquitectura en capas** con separacion de responsabilidades:

```
+------------------------------------------+
|         Capa de Presentacion             |
|       (Controllers - API REST)           |
+------------------+-----------------------+
                   |
+------------------v-----------------------+
|         Capa de Servicios                |
|    (Services - Logica de Negocio)        |
+------------------+-----------------------+
                   |
+------------------v-----------------------+
|       Capa de Acceso a Datos             |
|    (Entity Framework Core - ORM)         |
+------------------+-----------------------+
                   |
+------------------v-----------------------+
|           Base de Datos                  |
|          (SQL Server)                    |
+------------------------------------------+
```

## Estructura de carpetas

```
sdv-backend/
|
+-- Controllers/                    # Endpoints de la API
|   +-- AlumnoController.cs
|   +-- MaestroController.cs
|   +-- MensualidadController.cs
|   +-- ScheduleController.cs
|
+-- Data/
|   +-- DataDB/                     # Contexto de EF Core
|   |   +-- AppDBContext.cs
|   +-- Entities/                   # Modelos de base de datos
|       +-- Alumno.cs
|       +-- Maestro.cs
|       +-- Mensualidad.cs
|       +-- Room.cs
|       +-- TimeSlot.cs
|
+-- Infraestructure/
|   +-- API_Service_Interfaces/     # Contratos
|   |   +-- IAlumnoService.cs
|   |   +-- IMaestroService.cs
|   |   +-- IMensualidadService.cs
|   +-- API_Services/               # Implementaciones
|       +-- AlumnoService.cs
|       +-- MaestroService.cs
|       +-- MensualidadService.cs
|
+-- Migrations/                     # Migraciones de EF
+-- Program.cs                      # Configuracion y startup
```

## Patrones de diseno

### 1. Repository Pattern (implicito con EF Core)

Entity Framework Core actua como un repository generico:

```csharp
_context.Set<Mensualidad>()
    .Include(m => m.Alumno)
    .Where(m => m.EstadoPago == "PAGADO")
    .ToListAsync();
```

### 2. Dependency Injection

Los servicios se inyectan mediante el contenedor de DI de ASP.NET Core:

```csharp
// Program.cs
builder.Services.AddScoped<IMensualidadService, MensualidadService>();

// MensualidadController.cs
public MensualidadController(IMensualidadService mensualidadService)
{
    _mensualidadService = mensualidadService;
}
```

### 3. DTO Pattern

Separacion entre modelos de base de datos y objetos de transferencia:

```
Mensualidad (Entity) -> MensualidadOutPutDTO (DTO) -> JSON Response
```

### 4. Service Layer Pattern

La logica de negocio esta encapsulada en servicios:

- **Controllers** - Solo orquestan solicitudes HTTP
- **Services** - Contienen validaciones y logica

## Flujo de una peticion

Ejemplo: `POST /api/Mensualidad`

```
1. Request HTTP -> MensualidadController.Create()
                   |
2. Validacion basica del controller
                   |
3. _mensualidadService.CreateAsync(dto)
                   |
4. Validaciones de negocio (ValidateMensualidad)
                   |
5. Verificar si alumno existe
                   |
6. Verificar duplicados
                   |
7. _context.Add(entity)
   _context.SaveChangesAsync()
                   |
8. MapToOutputDTO()
                   |
9. Response 201 Created
```

## Modelo de datos

### Entidades principales

```
+-------------+       +--------------+
|   Alumno    |--+--->| Mensualidad  |
+-------------+  |    +--------------+
                 |
                 |    +--------------+
                 +--->|ClassSchedule |
                      +--------------+
                            |
                    +-------+-------+
                    |               |
            +-------+--+    +------+-----+
            |   Room   |    |  TimeSlot  |
            +----------+    +------------+
```

### Relaciones

- **Alumno** ? **Mensualidad** (1:N)
- **Alumno** ? **ClassSchedule** (1:N)
- **ClassSchedule** ? **Room** (N:1)
- **ClassSchedule** ? **TimeSlot** (N:1)
- **ClassSchedule** ? **Maestro** (N:1)

## Seguridad

### CORS

Configurado para permitir solo frontends específicos:

```csharp
policy.WithOrigins(
    "http://localhost:5173",
    "https://localhost:5173",
    // ...
);
```

### Validaciones

Multiple capas de validacion:

1. **Anotaciones de datos** en DTOs
2. **Validaciones personalizadas** en servicios
3. **Restricciones de base de datos** (unique constraints, foreign keys)

## Escalabilidad

El diseño permite:

- ? Agregar nuevos endpoints sin modificar servicios existentes
- ? Cambiar la implementacion de servicios sin tocar controllers
- ? Migrar a otro ORM sin afectar la capa de presentacion
- ? Agregar cache entre controller y service
- ? Implementar Unit of Work para transacciones complejas

## Rendimiento

### Consultas optimizadas

```csharp
// ? Bueno: Carga eager
var mensualidad = await _context.Set<Mensualidad>()
    .Include(m => m.Alumno)
    .FirstOrDefaultAsync(m => m.Id == id);

// ? Malo: N+1 queries
var mensualidades = await _context.Set<Mensualidad>().ToListAsync();
foreach (var m in mensualidades)
{
    var alumno = await _context.Alumnos.FindAsync(m.AlumnoId);
}
```

## Testing

Estructura recomendada:

```
Tests/
??? Unit/
?   ??? Services/
?   ??? Controllers/
??? Integration/
    ??? API/
```

## Proximas mejoras

- [ ] Implementar CQRS (Command Query Responsibility Segregation)
- [ ] Agregar AutoMapper para mapeo de DTOs
- [ ] Implementar MediatR para handlers
- [ ] Agregar Unit of Work explicito
- [ ] Implementar cache con Redis
