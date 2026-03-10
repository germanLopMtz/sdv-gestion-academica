# SDV Backend - Sistema de Gestion Academica

Bienvenido a la documentacion del **Sistema de Gestion Academica SDV**.

## Caracteristicas principales

- **Gestion de alumnos y maestros** - CRUD completo con validaciones
- **Sistema de horarios y aulas** - Asignacion inteligente de espacios
- **Control de mensualidades** - Registro de pagos con validacion de duplicados
- **Autenticacion de usuarios** - Sistema de login y permisos

## Arquitectura

Este proyecto esta construido con tecnologias modernas:

- **.NET 8** - Framework principal
- **Entity Framework Core 9** - ORM para base de datos
- **SQL Server** - Base de datos relacional
- **ASP.NET Core Web API** - API REST
- **Swagger/OpenAPI** - Documentacion interactiva de API

## Estructura del proyecto

```
sdv-backend/
+-- Controllers/          # Endpoints de la API
+-- Data/
|   +-- DataDB/           # Contexto de Entity Framework
|   +-- Entities/         # Modelos de base de datos
+-- Infraestructure/
|   +-- API_Services/     # Logica de negocio
|   +-- API_Service_Interfaces/
+-- Migrations/           # Migraciones de EF Core
```

## Enlaces rapidos

- [Referencia de API](api/index.md) - Documentacion completa de clases y metodos
- [Guia de inicio](articles/getting-started.md) - Como empezar a usar el proyecto
- [Arquitectura del sistema](articles/architecture.md) - Diseno y patrones utilizados
- [API de Mensualidades](articles/mensualidades.md) - Guia del modulo de pagos

## Repositorio

[GitHub - sdv-gestion-academica](https://github.com/germanLopMtz/sdv-gestion-academica)

## Contacto

Para dudas o sugerencias, contacta al equipo de desarrollo.
