# Mensualidades

Guia completa del modulo de gestion de mensualidades (pagos mensuales).

## Descripcion general

El modulo de mensualidades permite registrar, consultar y administrar los pagos mensuales de los alumnos.

## Caracteristicas principales

- Registro de pagos con validacion de duplicados
- Multiples conceptos de pago (Mensualidad, Inscripcion, Material)
- Estados de pago (PAGADO, PENDIENTE)
- Metodos de pago diversos (Efectivo, Transferencia, Tarjeta)
- Consulta por alumno, mes o estado
- Resumen general de pagos por alumno

## Endpoints disponibles

### 1. Listar todas las mensualidades

```http
GET /api/Mensualidad
```

**Respuesta:** `200 OK`

```json
[
  {
    "id": 1,
    "alumnoId": 5,
    "alumnoNombre": "Juan Perez Garcia",
    "alumnoCurso": "Seminario 1",
    "fechaPago": "2025-03-08T00:00:00",
    "monto": 1000.00,
    "concepto": "Mensualidad",
    "mes": "MAR",
    "metodoPago": "Efectivo",
    "estadoPago": "PAGADO",
    "observaciones": "",
    "createdAt": "2025-03-08T10:30:00",
    "updatedAt": null
  }
]
```

### 2. Obtener una mensualidad por ID

```http
GET /api/Mensualidad/{id}
```

**Parametros:**
- `id` (int): ID de la mensualidad

**Respuesta:** `200 OK` o `404 Not Found`

### 3. Registrar un nuevo pago

```http
POST /api/Mensualidad
```

**Body (JSON):**

```json
{
  "alumnoId": 5,
  "fechaPago": "2025-03-08",
  "monto": 1000.00,
  "concepto": "Mensualidad",
  "mes": "MAR",
  "metodoPago": "Efectivo",
  "estadoPago": "PAGADO",
  "observaciones": "Pago completo"
}
```

**Validaciones:**
- `alumnoId` debe ser > 0 y existir en BD
- `fechaPago` no puede ser futura
- `monto` debe ser > 0
- `mes` debe ser uno de: `ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC`
- `estadoPago` debe ser: `PAGADO` o `PENDIENTE`
- No puede haber un pago duplicado para el mismo alumno, mes y concepto

**Respuesta:** `201 Created`

```json
{
  "id": 15,
  "alumnoId": 5,
  "alumnoNombre": "Juan Perez Garcia"
}
```

**Errores comunes:**

```json
{ "message": "El alumno seleccionado no existe." }

{ "message": "Ya existe un pago registrado para Mensualidad del mes MAR." }

{ "message": "El mes debe ser uno de: ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC." }
```

### 4. Actualizar un pago existente

```http
PUT /api/Mensualidad/{id}
```

**Body:** Mismo formato que POST

**Respuesta:** `200 OK` o `404 Not Found`

### 5. Eliminar un pago

```http
DELETE /api/Mensualidad/{id}
```

**Respuesta:** `200 OK` o `404 Not Found`

```json
{ "message": "Mensualidad eliminada exitosamente." }
```

### 6. Obtener pagos de un alumno especifico

```http
GET /api/Mensualidad/alumno/{alumnoId}
```

**Respuesta:** `200 OK` con array de mensualidades del alumno

### 7. Resumen de mensualidades (vista principal)

```http
GET /api/Mensualidad/resumen
```

**Respuesta:** `200 OK`

```json
[
  {
    "alumnoId": 5,
    "nombreCompleto": "Juan Perez Garcia",
    "curso": "Seminario 1",
    "mensualidad": 1000.00,
    "pagos": {
      "ENE": "PAGADO",
      "FEB": null,
      "MAR": "PAGADO"
    },
    "registrosPorMes": {
      "ENE": 12,
      "MAR": 15
    },
    "totalPagado": 2000.00,
    "aula": null
  }
]
```

### 8. Filtrar por mes

```http
GET /api/Mensualidad/mes/{mes}
```

**Ejemplo:** `GET /api/Mensualidad/mes/MAR`

**Respuesta:** `200 OK` con array de pagos de ese mes

### 9. Filtrar por estado

```http
GET /api/Mensualidad/estado/{estado}
```

**Ejemplo:** `GET /api/Mensualidad/estado/PENDIENTE`

**Respuesta:** `200 OK` con array de pagos con ese estado

## Tipos de concepto

Los conceptos mas comunes son:

- **Mensualidad** - Pago mensual regular
- **Inscripcion** - Pago unico al iniciar curso
- **Material** - Pago por libros o materiales
- **Examen** - Pago de certificacion

## Metodos de pago aceptados

- Efectivo
- Transferencia
- Tarjeta de debito
- Tarjeta de credito
- Deposito bancario

## Montos por curso

| Curso | Monto Mensual |
|-------|---------------|
| Seminario 1 | $1,000.00 |
| Seminario 2 | $1,000.00 |
| Diplomado N4 | $900.00 |
| Diplomado N5 | $900.00 |
| InfKids 1 | $800.00 |
| InfKids 2 | $800.00 |
| Club Masters | $950.00 |

## Ejemplo de uso con cURL

```bash
# Registrar un pago
curl -X POST "https://localhost:5001/api/Mensualidad" \
  -H "Content-Type: application/json" \
  -d '{
    "alumnoId": 5,
    "fechaPago": "2025-03-08",
    "monto": 1000.00,
    "concepto": "Mensualidad",
    "mes": "MAR",
    "metodoPago": "Efectivo",
    "estadoPago": "PAGADO",
    "observaciones": ""
  }'

# Obtener pagos de un alumno
curl -X GET "https://localhost:5001/api/Mensualidad/alumno/5"

# Obtener resumen general
curl -X GET "https://localhost:5001/api/Mensualidad/resumen"
```

## Solucion de problemas

### Error: "La fecha de pago no puede ser futura"

**Causa:** Enviaste una fecha mayor a la actual.

**Solucion:** Usa una fecha valida en formato `YYYY-MM-DD`:

```json
{ "fechaPago": "2025-03-08" }
```

### Error: "El mes debe ser uno de: ENE, FEB, MAR..."

**Causa:** El mes no esta en el formato correcto.

**Solucion:** Usa las abreviaturas de 3 letras en mayusculas:

```json
{ "mes": "MAR" }
```

### Error: "Ya existe un pago registrado para..."

**Causa:** Ya existe un pago PAGADO para ese alumno, mes y concepto.

**Solucion:**
1. Verifica si el pago ya fue registrado
2. Si quieres cambiarlo, usa `PUT` en lugar de `POST`
3. O usa un concepto diferente

## Clases relacionadas

- `MensualidadService` - Logica de negocio
- `MensualidadController` - Endpoints HTTP
- `Mensualidad` - Entidad de base de datos
- `MensualidadDTO` - Objeto de entrada
- `MensualidadOutPutDTO` - Objeto de salida

## Ver tambien

- [Guia de Alumnos](alumnos.md)
- [Arquitectura del sistema](architecture.md)
- [Referencia completa de API](../api/index.md)
