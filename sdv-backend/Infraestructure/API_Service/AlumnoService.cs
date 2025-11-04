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
    public class AlumnoService : IAlumnoService
    {
        private readonly AppDBContext _context;

        public AlumnoService(AppDBContext context)
        {
     _context = context;
        }

     public async Task<AlumnoOutPutDTO> CreateAsync(AlumnosDTO dto)
        {
  // Validaciones
    ValidateAlumno(dto);
            await ValidateEmailUniqueAsync(dto.CorreoElectronico);

            var entity = new Alumno
 {
        NombreCompleto = dto.NombreCompleto,
        TipoDeCurso = dto.TipoDeCurso,
         FechaNacimiento = dto.FechaNacimiento,
                Procedencia = dto.Procedencia,
   Modalidad = dto.Modalidad,
      CorreoElectronico = dto.CorreoElectronico.Trim().ToLower(),
      Telefono = dto.Telefono,
              NumeroDiplomado = dto.NumeroDiplomado
            };

       _context.Alumnos.Add(entity);
            await _context.SaveChangesAsync();

            return MapToOutputDTO(entity);
        }

        public async Task<AlumnoOutPutDTO?> GetByIdAsync(int id)
        {
            var entity = await _context.Alumnos.FindAsync(id);
            return entity == null ? null : MapToOutputDTO(entity);
        }

        public async Task<List<AlumnoOutPutDTO>> GetAllAsync()
        {
          var alumnos = await _context.Alumnos
        .OrderBy(a => a.NombreCompleto)
      .ToListAsync();

            return alumnos.Select(MapToOutputDTO).ToList();
        }

        public async Task<AlumnoOutPutDTO?> UpdateAsync(int id, AlumnosDTO dto)
 {
            var entity = await _context.Alumnos.FindAsync(id);
            if (entity == null) return null;

// Validaciones
    ValidateAlumno(dto);
            await ValidateEmailUniqueAsync(dto.CorreoElectronico, id);

     entity.NombreCompleto = dto.NombreCompleto;
        entity.CorreoElectronico = dto.CorreoElectronico.Trim().ToLower();
   entity.TipoDeCurso = dto.TipoDeCurso;
        entity.Modalidad = dto.Modalidad;
      entity.Procedencia = dto.Procedencia;
    entity.Telefono = dto.Telefono;
   entity.FechaNacimiento = dto.FechaNacimiento;
            entity.NumeroDiplomado = dto.NumeroDiplomado;

        await _context.SaveChangesAsync();

          return MapToOutputDTO(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
  var entity = await _context.Alumnos.FindAsync(id);
   if (entity == null) return false;

      // Verificar si el alumno está inscrito en clases
            var hasEnrolledClasses = await _context.ClassStudents
         .AnyAsync(cs => cs.AlumnoId == id);

            if (hasEnrolledClasses)
 throw new InvalidOperationException("No se puede eliminar el alumno porque está inscrito en clases.");

   _context.Alumnos.Remove(entity);
   await _context.SaveChangesAsync();
    return true;
    }

        public async Task<List<AlumnoOutPutDTO>> GetAvailableAlumnosAsync()
        {
var alumnos = await _context.Alumnos
    .OrderBy(a => a.NombreCompleto)
     .ToListAsync();

     return alumnos.Select(MapToOutputDTO).ToList();
        }

        public async Task<List<AlumnoOutPutDTO>> GetAlumnosByTipoAsync(CursoType tipo)
        {
            var alumnos = await _context.Alumnos
                .Where(a => a.TipoDeCurso == tipo)
  .OrderBy(a => a.NombreCompleto)
.ToListAsync();

            return alumnos.Select(MapToOutputDTO).ToList();
        }

        private void ValidateAlumno(AlumnosDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NombreCompleto))
     throw new InvalidOperationException("El nombre completo es requerido.");

 if (string.IsNullOrWhiteSpace(dto.CorreoElectronico))
       throw new InvalidOperationException("El correo electrónico es requerido.");

     if (dto.FechaNacimiento > DateTime.Now.AddYears(-16))
       throw new InvalidOperationException("El alumno debe tener al menos 16 años.");

        if (dto.TipoDeCurso == CursoType.None)
    throw new InvalidOperationException("Debe seleccionar un tipo de curso válido.");

            if (dto.Modalidad == ModalidadCurso.None)
           throw new InvalidOperationException("Debe seleccionar una modalidad válida.");

            // Validar número de diplomado para diplomados
         if (dto.TipoDeCurso == CursoType.Diplomado && !dto.NumeroDiplomado.HasValue)
          throw new InvalidOperationException("El número de diplomado es requerido para diplomados.");

        // Validar que no sea necesario número de diplomado para seminarios
            if (dto.TipoDeCurso == CursoType.Seminario && dto.NumeroDiplomado.HasValue)
                throw new InvalidOperationException("Los seminarios no requieren número de diplomado.");
        }

        private async Task ValidateEmailUniqueAsync(string email, int? excludeId = null)
        {
    var normalizedEmail = email.Trim().ToLower();
            
      // Verificar en alumnos
      var queryAlumnos = _context.Alumnos.Where(a => a.CorreoElectronico == normalizedEmail);
            if (excludeId.HasValue)
     queryAlumnos = queryAlumnos.Where(a => a.Id != excludeId.Value);

         if (await queryAlumnos.AnyAsync())
    throw new InvalidOperationException("Ya existe un alumno con este correo electrónico.");

      // También verificar que no exista en usuarios
            var existsInUsuarios = await _context.Usuarios
  .Where(u => u.CorreoElectronico == normalizedEmail)
   .AnyAsync();

            if (existsInUsuarios)
         throw new InvalidOperationException("Ya existe un usuario con este correo electrónico.");
    }

     private AlumnoOutPutDTO MapToOutputDTO(Alumno alumno)
        {
        return new AlumnoOutPutDTO
            {
      Id = alumno.Id,
       NombreCompleto = alumno.NombreCompleto,
        TipoDeCurso = alumno.TipoDeCurso,
      FechaNacimiento = alumno.FechaNacimiento,
          Procedencia = alumno.Procedencia,
 Modalidad = alumno.Modalidad,
    CorreoElectronico = alumno.CorreoElectronico,
         Telefono = alumno.Telefono,
         NumeroDiplomado = alumno.NumeroDiplomado
     };
        }
    }
}
