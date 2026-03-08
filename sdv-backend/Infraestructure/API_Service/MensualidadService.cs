using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Infraestructure.API_Services
{
    /// <summary>
    /// Servicio para la gesti�n de mensualidades
  /// </summary>
    public class MensualidadService : IMensualidadService
    {
 private readonly AppDBContext _context;

        public MensualidadService(AppDBContext context)
        {
       _context = context;
        }

      /// <summary>
   /// Registra un nuevo pago de mensualidad
        /// </summary>
        public async Task<MensualidadOutPutDTO> CreateAsync(MensualidadDTO dto)
        {
        // Validaciones
         ValidateMensualidad(dto);

   // Verificar que el alumno existe
            var alumno = await _context.Alumnos
  .FirstOrDefaultAsync(a => a.Id == dto.AlumnoId);
         
if (alumno == null)
         throw new InvalidOperationException("El alumno seleccionado no existe.");

            // Verificar si ya existe un pago para ese alumno, mes y concepto
    var existePago = await _context.Set<Mensualidad>()
           .AnyAsync(m => m.AlumnoId == dto.AlumnoId 
       && m.Mes == dto.Mes 
         && m.Concepto == dto.Concepto
          && m.EstadoPago == "PAGADO");

 if (existePago)
      throw new InvalidOperationException(
        $"Ya existe un pago registrado para {dto.Concepto} del mes {dto.Mes}.");

    var entity = new Mensualidad
     {
   AlumnoId = dto.AlumnoId,
       FechaPago = dto.FechaPago,
         Monto = dto.Monto,
  Concepto = dto.Concepto,
    Mes = dto.Mes,
     MetodoPago = dto.MetodoPago,
    EstadoPago = dto.EstadoPago,
             Observaciones = dto.Observaciones,
       CreatedAt = DateTime.UtcNow
   };

            _context.Set<Mensualidad>().Add(entity);
      await _context.SaveChangesAsync();

        return await GetByIdAsync(entity.Id) 
 ?? throw new Exception("Error al recuperar la mensualidad creada.");
        }

        /// <summary>
        /// Obtiene una mensualidad por su ID
   /// </summary>
public async Task<MensualidadOutPutDTO?> GetByIdAsync(int id)
        {
    var mensualidad = await _context.Set<Mensualidad>()
    .Include(m => m.Alumno)
         .FirstOrDefaultAsync(m => m.Id == id);

if (mensualidad == null) return null;

    return MapToOutputDTO(mensualidad);
        }

 /// <summary>
 /// Obtiene todas las mensualidades registradas
   /// </summary>
        public async Task<List<MensualidadOutPutDTO>> GetAllAsync()
   {
            var mensualidades = await _context.Set<Mensualidad>()
        .Include(m => m.Alumno)
        .OrderByDescending(m => m.FechaPago)
           .ToListAsync();

       return mensualidades.Select(MapToOutputDTO).ToList();
     }

        /// <summary>
     /// Actualiza un pago de mensualidad existente
        /// </summary>
  public async Task<MensualidadOutPutDTO?> UpdateAsync(int id, MensualidadDTO dto)
        {
    var entity = await _context.Set<Mensualidad>()
          .FirstOrDefaultAsync(m => m.Id == id);
         
      if (entity == null) return null;

  // Validaciones
    ValidateMensualidad(dto);

            // Verificar que el alumno existe
       var alumno = await _context.Alumnos
                .FirstOrDefaultAsync(a => a.Id == dto.AlumnoId);
     
         if (alumno == null)
  throw new InvalidOperationException("El alumno seleccionado no existe.");

    // Actualizar propiedades
      entity.AlumnoId = dto.AlumnoId;
  entity.FechaPago = dto.FechaPago;
 entity.Monto = dto.Monto;
      entity.Concepto = dto.Concepto;
    entity.Mes = dto.Mes;
    entity.MetodoPago = dto.MetodoPago;
            entity.EstadoPago = dto.EstadoPago;
      entity.Observaciones = dto.Observaciones;
      entity.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

    return await GetByIdAsync(id);
        }

        /// <summary>
   /// Elimina un registro de mensualidad
  /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
   var entity = await _context.Set<Mensualidad>().FindAsync(id);
      if (entity == null) return false;

      _context.Set<Mensualidad>().Remove(entity);
       await _context.SaveChangesAsync();
     return true;
        }

   /// <summary>
        /// Obtiene las mensualidades de un alumno espec�fico
    /// </summary>
        public async Task<List<MensualidadOutPutDTO>> GetByAlumnoIdAsync(int alumnoId)
   {
   var mensualidades = await _context.Set<Mensualidad>()
          .Include(m => m.Alumno)
    .Where(m => m.AlumnoId == alumnoId)
 .OrderByDescending(m => m.FechaPago)
           .ToListAsync();

        return mensualidades.Select(MapToOutputDTO).ToList();
        }

 /// <summary>
      /// Obtiene un resumen de mensualidades por alumno (para la vista principal)
  /// </summary>
   public async Task<List<MensualidadResumenDTO>> GetResumenMensualidadesAsync()
     {
        var alumnos = await _context.Alumnos
      .Include(a => a.TipoDeCurso)
   .ToListAsync();

        var mensualidades = await _context.Set<Mensualidad>()
          .Where(m => m.EstadoPago == "PAGADO")
           .ToListAsync();

       var meses = new[] { "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC" };

     var resumen = alumnos.Select(alumno =>
       {
         var pagosAlumno = mensualidades
        .Where(m => m.AlumnoId == alumno.Id)
         .ToList();

      var pagosPorMes = new Dictionary<string, string?>();
      var registrosPorMes = new Dictionary<string, int>();
     foreach (var mes in meses)
       {
     var pago = pagosAlumno.FirstOrDefault(p => p.Mes == mes && p.Concepto == "Mensualidad");
      pagosPorMes[mes] = pago != null ? "PAGADO" : null;
      if (pago != null) registrosPorMes[mes] = pago.Id;
      }

            var totalPagado = pagosAlumno
         .Where(p => p.Concepto == "Mensualidad")
         .Sum(p => p.Monto);

  // Determinar monto de mensualidad seg�n tipo de curso
                var mensualidadMonto = alumno.TipoDeCurso switch
         {
            CursoType.Seminario1 => 1000m,
           CursoType.Seminario2 => 1000m,
         CursoType.DiplomadoN4 => 900m,
    CursoType.DiplomadoN5 => 900m,
             CursoType.InfKids1 => 800m,
  CursoType.InfKids2 => 800m,
           CursoType.ClubMasters => 950m,
          _ => 0m
     };

var cursoNombre = alumno.TipoDeCurso switch
       {
     CursoType.Seminario1 => "Seminario 1",
          CursoType.Seminario2 => "Seminario 2",
       CursoType.DiplomadoN4 => "Diplomado N4",
 CursoType.DiplomadoN5 => "Diplomado N5",
     CursoType.InfKids1 => "InfKids 1",
           CursoType.InfKids2 => "InfKids 2",
      CursoType.ClubMasters => "Club Masters",
   _ => "N/A"
   };

           return new MensualidadResumenDTO
     {
        AlumnoId = alumno.Id,
 NombreCompleto = alumno.NombreCompleto,
      Curso = cursoNombre,
  Mensualidad = mensualidadMonto,
          Pagos = pagosPorMes,
          RegistrosPorMes = registrosPorMes,
          TotalPagado = totalPagado,
           Aula = null // Puede obtenerse de ClassSchedule si es necesario
   };
          }).ToList();

     return resumen;
        }

        /// <summary>
        /// Obtiene las mensualidades filtradas por mes
        /// </summary>
 public async Task<List<MensualidadOutPutDTO>> GetByMesAsync(string mes)
  {
  var mensualidades = await _context.Set<Mensualidad>()
      .Include(m => m.Alumno)
     .Where(m => m.Mes == mes)
       .OrderByDescending(m => m.FechaPago)
.ToListAsync();

       return mensualidades.Select(MapToOutputDTO).ToList();
        }

        /// <summary>
   /// Obtiene las mensualidades filtradas por estado (PAGADO, PENDIENTE)
    /// </summary>
   public async Task<List<MensualidadOutPutDTO>> GetByEstadoAsync(string estado)
      {
     var mensualidades = await _context.Set<Mensualidad>()
     .Include(m => m.Alumno)
     .Where(m => m.EstadoPago == estado)
     .OrderByDescending(m => m.FechaPago)
     .ToListAsync();

       return mensualidades.Select(MapToOutputDTO).ToList();
     }

  /// <summary>
        /// Valida los datos de una mensualidad
        /// </summary>
 private void ValidateMensualidad(MensualidadDTO dto)
     {
    if (dto.AlumnoId <= 0)
             throw new InvalidOperationException("Debe seleccionar un alumno v�lido.");

          if (dto.FechaPago > DateTime.Now)
                throw new InvalidOperationException("La fecha de pago no puede ser futura.");

            if (dto.Monto <= 0)
    throw new InvalidOperationException("El monto debe ser mayor a cero.");

      if (string.IsNullOrWhiteSpace(dto.Concepto))
        throw new InvalidOperationException("El concepto es requerido.");

        if (string.IsNullOrWhiteSpace(dto.Mes))
          throw new InvalidOperationException("El mes es requerido.");

       var mesesValidos = new[] { "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC" };
            if (!mesesValidos.Contains(dto.Mes))
      throw new InvalidOperationException("El mes debe ser uno de: ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC.");

    if (string.IsNullOrWhiteSpace(dto.MetodoPago))
      throw new InvalidOperationException("El m�todo de pago es requerido.");

            var estadosValidos = new[] { "PAGADO", "PENDIENTE" };
            if (!estadosValidos.Contains(dto.EstadoPago))
          throw new InvalidOperationException("El estado debe ser PAGADO o PENDIENTE.");
    }

        /// <summary>
   /// Mapea una entidad Mensualidad a su DTO de salida
  /// </summary>
    private MensualidadOutPutDTO MapToOutputDTO(Mensualidad mensualidad)
{
     var cursoNombre = mensualidad.Alumno.TipoDeCurso switch
     {
         CursoType.Seminario1 => "Seminario 1",
 CursoType.Seminario2 => "Seminario 2",
    CursoType.DiplomadoN4 => "Diplomado N4",
      CursoType.DiplomadoN5 => "Diplomado N5",
  CursoType.InfKids1 => "InfKids 1",
  CursoType.InfKids2 => "InfKids 2",
     CursoType.ClubMasters => "Club Masters",
          _ => "N/A"
    };

   return new MensualidadOutPutDTO
         {
         Id = mensualidad.Id,
          AlumnoId = mensualidad.AlumnoId,
       AlumnoNombre = mensualidad.Alumno.NombreCompleto,
AlumnoCurso = cursoNombre,
       FechaPago = mensualidad.FechaPago,
     Monto = mensualidad.Monto,
       Concepto = mensualidad.Concepto,
      Mes = mensualidad.Mes,
    MetodoPago = mensualidad.MetodoPago,
   EstadoPago = mensualidad.EstadoPago,
     Observaciones = mensualidad.Observaciones,
       CreatedAt = mensualidad.CreatedAt,
  UpdatedAt = mensualidad.UpdatedAt
};
      }
    }
}
