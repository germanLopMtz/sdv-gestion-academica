using sdv_backend.Data;
using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Infraestructure.API_Services
{
    public class MensualidadService : IMensualidadService
    {
        private readonly AppDBContext _context;

        public MensualidadService(AppDBContext context)
        {
            _context = context;
        }

        public async Task<MensualidadOutPutDTO> CreateAsync(MensualidadDTO dto)
        {
            ValidateMensualidad(dto);

            // Verificar si ya existe una mensualidad para el mismo alumno, mes y año
            var existe = await _context.Mensualidades
                .AnyAsync(m => m.AlumnoId == dto.AlumnoId && 
                              m.Mes == dto.Mes && 
                              m.Año == dto.Año &&
                              m.Concepto == dto.Concepto);

            if (existe)
                throw new InvalidOperationException("Ya existe una mensualidad para este alumno, mes, año y concepto.");

            var entity = new Mensualidad
            {
                AlumnoId = dto.AlumnoId,
                Mes = dto.Mes,
                Año = dto.Año,
                Monto = dto.Monto,
                Estado = dto.Estado,
                FechaPago = dto.FechaPago,
                Concepto = dto.Concepto,
                MetodoPago = dto.MetodoPago,
                Observaciones = dto.Observaciones,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Mensualidades.Add(entity);
            await _context.SaveChangesAsync();

            return await MapToOutputDTOAsync(entity);
        }

        public async Task<MensualidadOutPutDTO?> GetByIdAsync(int id)
        {
            var entity = await _context.Mensualidades
                .Include(m => m.Alumno)
                .FirstOrDefaultAsync(m => m.Id == id);

            return entity == null ? null : await MapToOutputDTOAsync(entity);
        }

        public async Task<List<MensualidadOutPutDTO>> GetAllAsync()
        {
            var mensualidades = await _context.Mensualidades
                .Include(m => m.Alumno)
                .OrderByDescending(m => m.Año)
                .ThenByDescending(m => m.Mes)
                .ThenBy(m => m.Alumno.NombreCompleto)
                .ToListAsync();

            var result = new List<MensualidadOutPutDTO>();
            foreach (var mensualidad in mensualidades)
            {
                result.Add(await MapToOutputDTOAsync(mensualidad));
            }
            return result;
        }

        public async Task<List<MensualidadResumenDTO>> GetResumenAsync(int? año = null)
        {
            var añoActual = año ?? DateTime.Now.Year;
            var meses = Enum.GetValues(typeof(Mes)).Cast<Mes>().ToList();

            var alumnos = await _context.Alumnos.ToListAsync();
            var mensualidades = await _context.Mensualidades
                .Include(m => m.Alumno)
                .Where(m => m.Año == añoActual && m.Concepto == ConceptoPago.Mensualidad)
                .ToListAsync();

            var resumen = new List<MensualidadResumenDTO>();

            foreach (var alumno in alumnos)
            {
                var mensualidadesAlumno = mensualidades
                    .Where(m => m.AlumnoId == alumno.Id)
                    .ToList();

                var montoMensualidad = mensualidadesAlumno.FirstOrDefault()?.Monto ?? 0;
                if (montoMensualidad == 0)
                {
                    // Intentar obtener el monto de otra mensualidad del alumno
                    var otraMensualidad = await _context.Mensualidades
                        .Where(m => m.AlumnoId == alumno.Id)
                        .OrderByDescending(m => m.FechaCreacion)
                        .FirstOrDefaultAsync();
                    montoMensualidad = otraMensualidad?.Monto ?? 0;
                }

                var pagosPorMes = new Dictionary<string, string?>();
                var fechaActual = DateTime.Now;
                
                foreach (var mes in meses)
                {
                    var mensualidad = mensualidadesAlumno.FirstOrDefault(m => m.Mes == mes);
                    if (mensualidad != null)
                    {
                        // Si hay mensualidad registrada, usar su estado
                        pagosPorMes[mes.ToString()] = mensualidad.Estado == EstadoPago.Pagado ? "PAGADO" : "PENDIENTE";
                    }
                    else
                    {
                        // Si no hay mensualidad registrada, verificar si el mes ya pasó
                        var (numeroMes, añoMes) = MesToMonthNumberAndYear(mes, añoActual);
                        var fechaMes = new DateTime(añoMes, numeroMes, 1);
                        
                        // Si el mes ya pasó (es anterior al día actual), marcarlo como PENDIENTE
                        if (fechaMes < fechaActual)
                        {
                            pagosPorMes[mes.ToString()] = "PENDIENTE";
                        }
                        else
                        {
                            // Si el mes aún no llega, dejarlo como null
                            pagosPorMes[mes.ToString()] = null;
                        }
                    }
                }

                var totalPagado = mensualidadesAlumno
                    .Where(m => m.Estado == EstadoPago.Pagado)
                    .Sum(m => m.Monto);

                var curso = GetCursoDisplay(alumno);

                resumen.Add(new MensualidadResumenDTO
                {
                    AlumnoId = alumno.Id,
                    AlumnoNombre = alumno.NombreCompleto,
                    Curso = curso,
                    MontoMensualidad = montoMensualidad,
                    PagosPorMes = pagosPorMes,
                    TotalPagado = totalPagado
                });
            }

            return resumen.OrderBy(r => r.AlumnoNombre).ToList();
        }

        public async Task<List<MensualidadOutPutDTO>> GetByAlumnoAsync(int alumnoId, int? año = null)
        {
            var query = _context.Mensualidades
                .Include(m => m.Alumno)
                .Where(m => m.AlumnoId == alumnoId);

            if (año.HasValue)
                query = query.Where(m => m.Año == año.Value);

            var mensualidades = await query
                .OrderByDescending(m => m.Año)
                .ThenByDescending(m => m.Mes)
                .ToListAsync();

            var result = new List<MensualidadOutPutDTO>();
            foreach (var mensualidad in mensualidades)
            {
                result.Add(await MapToOutputDTOAsync(mensualidad));
            }
            return result;
        }

        public async Task<List<MensualidadOutPutDTO>> GetByMesAsync(Mes mes, int año)
        {
            var mensualidades = await _context.Mensualidades
                .Include(m => m.Alumno)
                .Where(m => m.Mes == mes && m.Año == año)
                .OrderBy(m => m.Alumno.NombreCompleto)
                .ToListAsync();

            var result = new List<MensualidadOutPutDTO>();
            foreach (var mensualidad in mensualidades)
            {
                result.Add(await MapToOutputDTOAsync(mensualidad));
            }
            return result;
        }

        public async Task<List<MensualidadOutPutDTO>> GetByEstadoAsync(EstadoPago estado, int? año = null)
        {
            var query = _context.Mensualidades
                .Include(m => m.Alumno)
                .Where(m => m.Estado == estado);

            if (año.HasValue)
                query = query.Where(m => m.Año == año.Value);

            var mensualidades = await query
                .OrderByDescending(m => m.Año)
                .ThenByDescending(m => m.Mes)
                .ThenBy(m => m.Alumno.NombreCompleto)
                .ToListAsync();

            var result = new List<MensualidadOutPutDTO>();
            foreach (var mensualidad in mensualidades)
            {
                result.Add(await MapToOutputDTOAsync(mensualidad));
            }
            return result;
        }

        public async Task<MensualidadOutPutDTO?> UpdateAsync(int id, MensualidadDTO dto)
        {
            var entity = await _context.Mensualidades.FindAsync(id);
            if (entity == null) return null;

            ValidateMensualidad(dto);

            // Verificar duplicados solo si cambió alumno, mes, año o concepto
            if (entity.AlumnoId != dto.AlumnoId || 
                entity.Mes != dto.Mes || 
                entity.Año != dto.Año ||
                entity.Concepto != dto.Concepto)
            {
                var existe = await _context.Mensualidades
                    .AnyAsync(m => m.Id != id &&
                                  m.AlumnoId == dto.AlumnoId &&
                                  m.Mes == dto.Mes &&
                                  m.Año == dto.Año &&
                                  m.Concepto == dto.Concepto);

                if (existe)
                    throw new InvalidOperationException("Ya existe una mensualidad para este alumno, mes, año y concepto.");
            }

            entity.AlumnoId = dto.AlumnoId;
            entity.Mes = dto.Mes;
            entity.Año = dto.Año;
            entity.Monto = dto.Monto;
            entity.Estado = dto.Estado;
            entity.FechaPago = dto.FechaPago;
            entity.Concepto = dto.Concepto;
            entity.MetodoPago = dto.MetodoPago;
            entity.Observaciones = dto.Observaciones;
            entity.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await MapToOutputDTOAsync(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Mensualidades.FindAsync(id);
            if (entity == null) return false;

            _context.Mensualidades.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MensualidadOutPutDTO>> BuscarAsync(string searchTerm)
        {
            var term = searchTerm.ToLower().Trim();
            var mensualidades = await _context.Mensualidades
                .Include(m => m.Alumno)
                .Where(m => m.Alumno.NombreCompleto.ToLower().Contains(term))
                .OrderByDescending(m => m.Año)
                .ThenByDescending(m => m.Mes)
                .ThenBy(m => m.Alumno.NombreCompleto)
                .ToListAsync();

            var result = new List<MensualidadOutPutDTO>();
            foreach (var mensualidad in mensualidades)
            {
                result.Add(await MapToOutputDTOAsync(mensualidad));
            }
            return result;
        }

        private void ValidateMensualidad(MensualidadDTO dto)
        {
            if (dto.AlumnoId <= 0)
                throw new InvalidOperationException("El ID del alumno es requerido.");

            if (dto.Monto <= 0)
                throw new InvalidOperationException("El monto debe ser mayor a cero.");

            if (dto.Año < 2000 || dto.Año > 2100)
                throw new InvalidOperationException("El año debe ser válido.");

            if (dto.Estado == EstadoPago.Pagado && !dto.FechaPago.HasValue)
                throw new InvalidOperationException("La fecha de pago es requerida cuando el estado es Pagado.");
        }

        private async Task<MensualidadOutPutDTO> MapToOutputDTOAsync(Mensualidad mensualidad)
        {
            await _context.Entry(mensualidad).Reference(m => m.Alumno).LoadAsync();

            return new MensualidadOutPutDTO
            {
                Id = mensualidad.Id,
                AlumnoId = mensualidad.AlumnoId,
                AlumnoNombre = mensualidad.Alumno.NombreCompleto,
                Curso = GetCursoDisplay(mensualidad.Alumno),
                Mes = mensualidad.Mes,
                Año = mensualidad.Año,
                Monto = mensualidad.Monto,
                Estado = mensualidad.Estado,
                FechaPago = mensualidad.FechaPago,
                Concepto = mensualidad.Concepto,
                MetodoPago = mensualidad.MetodoPago,
                Observaciones = mensualidad.Observaciones,
                FechaCreacion = mensualidad.FechaCreacion,
                FechaActualizacion = mensualidad.FechaActualizacion
            };
        }

        private string GetCursoDisplay(Alumno alumno)
        {
            if (alumno.TipoDeCurso == CursoType.Diplomado && alumno.NumeroDiplomado.HasValue)
            {
                return $"Diplomado N{alumno.NumeroDiplomado.Value}";
            }
            else if (alumno.TipoDeCurso == CursoType.Seminario)
            {
                return "Seminario";
            }
            return "Sin curso";
        }

        private (int month, int year) MesToMonthNumberAndYear(Mes mes, int añoBase)
        {
            // Los meses van de AGO (agosto) a FEB (febrero del año siguiente)
            // AGO = 1 -> Agosto (8) del año base
            // SEP = 2 -> Septiembre (9) del año base
            // OCT = 3 -> Octubre (10) del año base
            // NOV = 4 -> Noviembre (11) del año base
            // DIC = 5 -> Diciembre (12) del año base
            // ENE = 6 -> Enero (1) del año siguiente
            // FEB = 7 -> Febrero (2) del año siguiente
            
            switch (mes)
            {
                case Mes.AGO:
                    return (8, añoBase);
                case Mes.SEP:
                    return (9, añoBase);
                case Mes.OCT:
                    return (10, añoBase);
                case Mes.NOV:
                    return (11, añoBase);
                case Mes.DIC:
                    return (12, añoBase);
                case Mes.ENE:
                    return (1, añoBase + 1); // Enero del año siguiente
                case Mes.FEB:
                    return (2, añoBase + 1); // Febrero del año siguiente
                default:
                    return (DateTime.Now.Month, DateTime.Now.Year);
            }
        }
    }
}

