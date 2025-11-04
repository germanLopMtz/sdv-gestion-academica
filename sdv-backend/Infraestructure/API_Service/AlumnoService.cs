using sdv_backend.Data;
using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
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
            var entity = new Alumno
       {
         NombreCompleto = dto.NombreCompleto,
       TipoDeCurso = dto.TipoDeCurso,
     FechaNacimiento = dto.FechaNacimiento,
  Procedencia = dto.Procedencia,
          Modalidad = dto.Modalidad,
CorreoElectronico = dto.CorreoElectronico,
    Telefono = dto.Telefono,
         NumeroDiplomado = dto.NumeroDiplomado // Añadir el campo
       };

  _context.Alumnos.Add(entity);
     await _context.SaveChangesAsync();

      return new AlumnoOutPutDTO
  {
      Id = entity.Id,
  NombreCompleto = dto.NombreCompleto,
    TipoDeCurso = dto.TipoDeCurso,
          FechaNacimiento = dto.FechaNacimiento,
       Procedencia = dto.Procedencia,
           Modalidad = dto.Modalidad,
    CorreoElectronico = dto.CorreoElectronico,
         Telefono = dto.Telefono,
           NumeroDiplomado = dto.NumeroDiplomado // Añadir el campo
      };
  }

        public async Task<AlumnoOutPutDTO?> GetByIdAsync(int id)
       {
            var entity = await _context.Alumnos.FindAsync(id);
    if (entity == null) return null;

    return new AlumnoOutPutDTO
    {
             Id = entity.Id,
    NombreCompleto = entity.NombreCompleto,
TipoDeCurso = entity.TipoDeCurso,
        FechaNacimiento = entity.FechaNacimiento,
   Procedencia = entity.Procedencia,
  Modalidad = entity.Modalidad,
   CorreoElectronico = entity.CorreoElectronico,
   Telefono = entity.Telefono,
         NumeroDiplomado = entity.NumeroDiplomado // Añadir el campo
       };
        }

     public async Task<List<AlumnoOutPutDTO>> GetAllAsync()
        {
   var Alumnos = await _context.Alumnos.ToListAsync();

    return Alumnos.Select(dto => new AlumnoOutPutDTO
    {
         Id=dto.Id,
    NombreCompleto = dto.NombreCompleto,
    TipoDeCurso = dto.TipoDeCurso,
 FechaNacimiento = dto.FechaNacimiento,
  Procedencia = dto.Procedencia,
    Modalidad = dto.Modalidad,
       CorreoElectronico = dto.CorreoElectronico,
          Telefono = dto.Telefono,
      NumeroDiplomado = dto.NumeroDiplomado // Añadir el campo
    }).ToList();
    }

        public async Task<AlumnoOutPutDTO?> UpdateAsync(int id, AlumnosDTO dto)
  {
     var entity = await _context.Alumnos.FindAsync(id);
     if (entity == null) return null;

 entity.NombreCompleto = dto.NombreCompleto;
            entity.CorreoElectronico = dto.CorreoElectronico;
    entity.TipoDeCurso = dto.TipoDeCurso;
     entity.Modalidad = dto.Modalidad;
     entity.Procedencia = dto.Procedencia;
    entity.Telefono = dto.Telefono;
entity.FechaNacimiento = dto.FechaNacimiento;
   entity.NumeroDiplomado = dto.NumeroDiplomado; // Añadir el campo

   await _context.SaveChangesAsync();

        return new AlumnoOutPutDTO
     {
 Id = entity.Id,
       NombreCompleto = dto.NombreCompleto,
  TipoDeCurso = dto.TipoDeCurso,
  FechaNacimiento = dto.FechaNacimiento,
   Procedencia = dto.Procedencia,
       Modalidad = dto.Modalidad,
       CorreoElectronico = dto.CorreoElectronico,
   Telefono = dto.Telefono,
                NumeroDiplomado = dto.NumeroDiplomado // Añadir el campo
         };
        }

   public async Task<bool> DeleteAsync(int id)
        {
       var entity = await _context.Alumnos.FindAsync(id);
      if (entity == null) return false;

            _context.Alumnos.Remove(entity);
  await _context.SaveChangesAsync();
       return true;
     }
    }
}
