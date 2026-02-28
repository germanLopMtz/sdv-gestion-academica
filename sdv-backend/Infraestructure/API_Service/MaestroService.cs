using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Infraestructure.API_Services
{
  public class MaestroService : IMaestroService
    {
        private readonly AppDBContext _context;

        public MaestroService(AppDBContext context)
        {
      _context = context;
        }

        public async Task<MaestroOutPutDTO> CreateAsync(MaestroDTO dto)
   {
         // Validaciones
    ValidateMaestro(dto);
            await ValidateEmailUniqueAsync(dto.CorreoElectronico);

var entity = new Usuario
  {
     NombreCompleto = dto.NombreCompleto,
  CorreoElectronico = dto.CorreoElectronico.Trim().ToLower(),
       Contrasena = dto.Contrasena,
       Direccion = dto.Direccion,
                Telefono = dto.Telefono,
    Tipo = UserType.Maestro,
         FechaNacimiento = dto.FechaNacimiento,
     Procedencia = dto.Procedencia,
            TipoDeCurso = dto.TipoDeCurso,
 
 CreatedAt = DateTime.UtcNow
        };

          _context.Usuarios.Add(entity);
          await _context.SaveChangesAsync();

            return MapToOutputDTO(entity);
        }

        public async Task<MaestroOutPutDTO?> GetByIdAsync(int id)
        {
 var entity = await _context.Usuarios
         .FirstOrDefaultAsync(u => u.Id == id && u.Tipo == UserType.Maestro);
      
   return entity == null ? null : MapToOutputDTO(entity);
        }

        public async Task<List<MaestroOutPutDTO>> GetAllAsync()
        {
        var maestros = await _context.Usuarios
             .Where(u => u.Tipo == UserType.Maestro)
     .OrderBy(u => u.NombreCompleto)
      .ToListAsync();

      return maestros.Select(MapToOutputDTO).ToList();
        }

        public async Task<MaestroOutPutDTO?> UpdateAsync(int id, MaestroDTO dto)
        {
      var entity = await _context.Usuarios
      .FirstOrDefaultAsync(u => u.Id == id && u.Tipo == UserType.Maestro);
       
if (entity == null) return null;

   // Validaciones
     ValidateMaestro(dto);
          await ValidateEmailUniqueAsync(dto.CorreoElectronico, id);

    entity.NombreCompleto = dto.NombreCompleto;
     entity.CorreoElectronico = dto.CorreoElectronico.Trim().ToLower();
        entity.Contrasena = dto.Contrasena;
            entity.Direccion = dto.Direccion;
        entity.Telefono = dto.Telefono;
      entity.FechaNacimiento = dto.FechaNacimiento;
   entity.Procedencia = dto.Procedencia;
            entity.TipoDeCurso = dto.TipoDeCurso;
  

            await _context.SaveChangesAsync();

            return MapToOutputDTO(entity);
        }

        public async Task<bool> DeleteAsync(int id)
   {
            var entity = await _context.Usuarios
   .FirstOrDefaultAsync(u => u.Id == id && u.Tipo == UserType.Maestro);
          
            if (entity == null) return false;

          // Verificar si el maestro tiene clases asignadas
      var hasScheduledClasses = await _context.ClassSchedules
    .AnyAsync(cs => cs.MaestroId == id);

   if (hasScheduledClasses)
            throw new InvalidOperationException("No se puede eliminar el maestro porque tiene clases asignadas.");

     _context.Usuarios.Remove(entity);
            await _context.SaveChangesAsync();
          return true;
    }

        public async Task<List<MaestroOutPutDTO>> GetAvailableMaestrosAsync()
    {
            var maestros = await _context.Usuarios
    .Where(u => u.Tipo == UserType.Maestro)
   .OrderBy(u => u.NombreCompleto)
   .ToListAsync();

 return maestros.Select(MapToOutputDTO).ToList();
        }

        public async Task<List<MaestroOutPutDTO>> GetMaestrosByTipoAsync(CursoType tipo)
    {
       var maestros = await _context.Usuarios
                .Where(u => u.Tipo == UserType.Maestro && u.TipoDeCurso == tipo)
    .OrderBy(u => u.NombreCompleto)
  .ToListAsync();

            return maestros.Select(MapToOutputDTO).ToList();
  }

        private void ValidateMaestro(MaestroDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NombreCompleto))
      throw new InvalidOperationException("El nombre completo es requerido.");

        if (string.IsNullOrWhiteSpace(dto.CorreoElectronico))
  throw new InvalidOperationException("El correo electrónico es requerido.");

  if (string.IsNullOrWhiteSpace(dto.Contrasena))
    throw new InvalidOperationException("La contraseña es requerida.");

        if (dto.FechaNacimiento > DateTime.Now.AddYears(-18))
       throw new InvalidOperationException("El maestro debe ser mayor de 18 años.");

         if (dto.TipoDeCurso == CursoType.None)
       throw new InvalidOperationException("Debe seleccionar un tipo de curso válido.");

 
        }

        private async Task ValidateEmailUniqueAsync(string email, int? excludeId = null)
        {
            var normalizedEmail = email.Trim().ToLower();
            
 // Verificar en usuarios
            var queryUsuarios = _context.Usuarios.Where(u => u.CorreoElectronico == normalizedEmail);
          if (excludeId.HasValue)
        queryUsuarios = queryUsuarios.Where(u => u.Id != excludeId.Value);

        if (await queryUsuarios.AnyAsync())
     throw new InvalidOperationException("Ya existe un usuario con este correo electrónico.");

      // También verificar que no exista en alumnos
      var existsInAlumnos = await _context.Alumnos
        .Where(a => a.CorreoElectronico == normalizedEmail)
      .AnyAsync();

            if (existsInAlumnos)
        throw new InvalidOperationException("Ya existe un alumno con este correo electrónico.");
        }

        private MaestroOutPutDTO MapToOutputDTO(Usuario usuario)
        {
     return new MaestroOutPutDTO
    {
        Id = usuario.Id,
        NombreCompleto = usuario.NombreCompleto,
        CorreoElectronico = usuario.CorreoElectronico,
        Direccion = usuario.Direccion,
        Telefono = usuario.Telefono,
        FechaNacimiento = usuario.FechaNacimiento ?? DateTime.MinValue,
        Procedencia = usuario.Procedencia ?? string.Empty,
        TipoDeCurso = usuario.TipoDeCurso ?? CursoType.None,
        CreatedAt = usuario.CreatedAt
        };
     }
    }
}