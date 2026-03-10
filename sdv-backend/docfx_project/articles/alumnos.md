# Alumnos

Guia completa del modulo de gestion de alumnos.

## Descripcion

El modulo de alumnos permite registrar, consultar y administrar la informacion de los estudiantes.

## Endpoints principales

### Listar todos los alumnos

```http
GET /api/Alumno
```

### Crear un nuevo alumno

```http
POST /api/Alumno
```

**Body:**
```json
{
  "nombreCompleto": "Maria Gonzalez Lopez",
  "correo": "maria.gonzalez@example.com",
  "telefono": "5551234567",
  "tipoDeCurso": 0
}
```

**Tipos de curso (enum):**
- `0` - Seminario1
- `1` - Seminario2
- `2` - DiplomadoN4
- `3` - DiplomadoN5
- `4` - InfKids1
- `5` - InfKids2
- `6` - ClubMasters

### Actualizar un alumno

```http
PUT /api/Alumno/{id}
```

### Eliminar un alumno

```http
DELETE /api/Alumno/{id}
```

## Ver tambien

- [API de Mensualidades](mensualidades.md)
- [Arquitectura](architecture.md)
