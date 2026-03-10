# Horarios

Guia del modulo de gestion de horarios y aulas.

## Descripcion

Sistema para asignar aulas y franjas horarias a las clases.

## Aulas disponibles

El sistema incluye por defecto:

1. Control Room 1
2. Control Room 2
3. Control Room 3
4. Maxiplaza

## Horarios PM disponibles

- 3:00-5:00 PM
- 5:30-7:30 PM
- 8:00-10:00 PM

## Endpoints principales

### Consultar horarios

```http
GET /api/Schedule
```

### Crear horario

```http
POST /api/Schedule
```

## Ver tambien

- [API de Maestros](maestros.md)
- [Arquitectura](architecture.md)
