# Introduccion a SDV Backend

## Que es SDV Backend?

SDV Backend es una **API REST** construida con **.NET 8** que proporciona servicios completos para la gestion academica de una institucion educativa.

## Objetivos del sistema

1. **Centralizar la informacion** de alumnos, maestros y pagos
2. **Automatizar procesos** administrativos repetitivos
3. **Proporcionar una API escalable** para multiples frontends
4. **Garantizar la integridad de datos** mediante validaciones robustas

## Modulos principales

### Gestion de Alumnos
- Registro completo de estudiantes
- Asociacion con tipos de curso
- Consulta y actualizacion de informacion
- Validacion de duplicados por correo

### Gestion de Maestros
- Alta de profesores
- Asignacion de materias
- Gestion de horarios de ensenanza

### Control de Mensualidades
- Registro de pagos mensuales
- Validacion de duplicados por mes y concepto
- Multiples metodos de pago (Efectivo, Transferencia, etc.)
- Estados de pago (PAGADO, PENDIENTE)
- Reporte de mensualidades por alumno
- Resumen general de pagos

### Horarios y Aulas
- Gestion de salas (Control Room 1, 2, 3, Maxiplaza)
- Franjas horarias predefinidas (PM)
- Asignacion de clases por dia de la semana

## Stack Tecnologico

| Tecnologia | Version | Proposito |
|-----------|---------|-----------|
| **.NET** | 8.0 | Framework principal |
| **ASP.NET Core** | 8.0 | Web API |
| **Entity Framework Core** | 9.0.9 | ORM |
| **SQL Server** | - | Base de datos |
| **Swagger** | 6.6.2 | Documentacion de API |
| **JWT Bearer** | 8.0.8 | Autenticacion |

## Seguridad

El sistema implementa:
- Autenticacion mediante JWT
- Validacion de datos en todos los endpoints
- CORS configurado para frontends especificos
- Proteccion contra duplicados

## Flujo de datos

```
Frontend -> API REST -> Service Layer -> EF Core -> SQL Server
```

## Siguiente paso

Consulta la [Guia de inicio](getting-started.md) para configurar tu entorno de desarrollo.
