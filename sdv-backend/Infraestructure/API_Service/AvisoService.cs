using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Infraestructure.API_Services
{
  public class AvisoService : IAvisoService
    {
  private readonly AppDBContext _context;

      public AvisoService(AppDBContext context)
   {
   _context = context;
        }

public async Task<AvisoOutPutDTO> CreateAsync(AvisoDTO dto, int usuarioCreadorId)
        {
 // Validaciones
    ValidateAviso(dto);
await ValidateUsuarioIsAdminAsync(usuarioCreadorId); // Validar que sea admin
  await ValidateMaestrosExistAsync(dto.MaestroIds);

          var aviso = new Aviso
    {
  Titulo = dto.Titulo,
  Mensaje = dto.Mensaje,
  FechaEnvio = dto.FechaEnvio,
    UsuarioCreadorId = usuarioCreadorId,
  FechaCreacion = DateTime.UtcNow,
     Estado = EstadoAviso.Programado
   };

   _context.Avisos.Add(aviso);
     await _context.SaveChangesAsync();

  // Agregar destinatarios
  foreach (var maestroId in dto.MaestroIds)
   {
       var destinatario = new AvisoDestinatario
       {
   AvisoId = aviso.Id,
          MaestroId = maestroId
  };
  _context.AvisoDestinatarios.Add(destinatario);
     }

            await _context.SaveChangesAsync();

       return await GetByIdAsync(aviso.Id) ?? throw new Exception("Error al recuperar el aviso creado.");
        }

   public async Task<AvisoOutPutDTO?> GetByIdAsync(int id)
 {
      var aviso = await _context.Avisos
 .Include(a => a.UsuarioCreador)
          .Include(a => a.Destinatarios)
     .ThenInclude(d => d.Maestro)
                .FirstOrDefaultAsync(a => a.Id == id);

        return aviso == null ? null : MapToOutputDTO(aviso);
        }

   public async Task<List<AvisoOutPutDTO>> GetAllAsync()
        {
     var avisos = await _context.Avisos
    .Include(a => a.UsuarioCreador)
   .Include(a => a.Destinatarios)
  .ThenInclude(d => d.Maestro)
  .OrderByDescending(a => a.FechaCreacion)
          .ToListAsync();

   return avisos.Select(MapToOutputDTO).ToList();
   }

        public async Task<List<AvisoOutPutDTO>> GetByEstadoAsync(EstadoAviso estado)
        {
            var avisos = await _context.Avisos
 .Include(a => a.UsuarioCreador)
      .Include(a => a.Destinatarios)
       .ThenInclude(d => d.Maestro)
      .Where(a => a.Estado == estado)
      .OrderByDescending(a => a.FechaCreacion)
           .ToListAsync();

       return avisos.Select(MapToOutputDTO).ToList();
        }

     public async Task<List<AvisoOutPutDTO>> GetByMaestroAsync(int maestroId)
        {
  var avisos = await _context.Avisos
 .Include(a => a.UsuarioCreador)
      .Include(a => a.Destinatarios)
          .ThenInclude(d => d.Maestro)
      .Where(a => a.Destinatarios.Any(d => d.MaestroId == maestroId))
  .OrderByDescending(a => a.FechaCreacion)
  .ToListAsync();

     return avisos.Select(MapToOutputDTO).ToList();
  }

  public async Task<AvisoOutPutDTO?> UpdateAsync(int id, AvisoDTO dto)
    {
       var aviso = await _context.Avisos
   .Include(a => a.Destinatarios)
       .FirstOrDefaultAsync(a => a.Id == id);

  if (aviso == null) return null;

    // No permitir editar avisos ya enviados
     if (aviso.Estado == EstadoAviso.Enviado)
          throw new InvalidOperationException("No se puede editar un aviso que ya ha sido enviado.");

   // Validaciones
   ValidateAviso(dto);
     await ValidateMaestrosExistAsync(dto.MaestroIds);

     aviso.Titulo = dto.Titulo;
  aviso.Mensaje = dto.Mensaje;
     aviso.FechaEnvio = dto.FechaEnvio;

// Actualizar destinatarios
  var existingMaestroIds = aviso.Destinatarios.Select(d => d.MaestroId).ToList();
  var toRemove = existingMaestroIds.Except(dto.MaestroIds).ToList();
        var toAdd = dto.MaestroIds.Except(existingMaestroIds).ToList();

            // Remover destinatarios
       foreach (var maestroId in toRemove)
            {
var destinatario = aviso.Destinatarios.First(d => d.MaestroId == maestroId);
      _context.AvisoDestinatarios.Remove(destinatario);
   }

   // Agregar nuevos destinatarios
     foreach (var maestroId in toAdd)
    {
       var destinatario = new AvisoDestinatario
  {
    AvisoId = aviso.Id,
            MaestroId = maestroId
       };
       _context.AvisoDestinatarios.Add(destinatario);
            }

   await _context.SaveChangesAsync();
 return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
     var aviso = await _context.Avisos.FindAsync(id);
      if (aviso == null) return false;

     // No permitir eliminar avisos ya enviados
     if (aviso.Estado == EstadoAviso.Enviado)
       throw new InvalidOperationException("No se puede eliminar un aviso que ya ha sido enviado.");

        _context.Avisos.Remove(aviso);
      await _context.SaveChangesAsync();
 return true;
   }

        public async Task<bool> EnviarAvisoAsync(int avisoId, int usuarioId)
        {
    // Validar que el usuario es admin
     await ValidateUsuarioIsAdminAsync(usuarioId);

            var aviso = await _context.Avisos.FindAsync(avisoId);
       if (aviso == null) return false;

     if (aviso.Estado != EstadoAviso.Programado)
   throw new InvalidOperationException("Solo se pueden enviar avisos programados.");

    aviso.Estado = EstadoAviso.Enviado;
  await _context.SaveChangesAsync();
       return true;
        }

        public async Task<bool> CancelarAvisoAsync(int avisoId)
      {
            var aviso = await _context.Avisos.FindAsync(avisoId);
   if (aviso == null) return false;

if (aviso.Estado == EstadoAviso.Enviado)
           throw new InvalidOperationException("No se puede cancelar un aviso que ya ha sido enviado.");

    aviso.Estado = EstadoAviso.Cancelado;
    await _context.SaveChangesAsync();
  return true;
   }

public async Task<bool> MarcarComoLeidoAsync(int avisoId, int maestroId)
        {
      var destinatario = await _context.AvisoDestinatarios
        .FirstOrDefaultAsync(d => d.AvisoId == avisoId && d.MaestroId == maestroId);

        if (destinatario == null) return false;

            destinatario.Leido = true;
         destinatario.FechaLectura = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    return true;
    }

      public async Task<List<AvisoOutPutDTO>> SearchAsync(string searchTerm)
        {
if (string.IsNullOrWhiteSpace(searchTerm))
       return await GetAllAsync();

 var avisos = await _context.Avisos
         .Include(a => a.UsuarioCreador)
     .Include(a => a.Destinatarios)
     .ThenInclude(d => d.Maestro)
  .Where(a => a.Titulo.Contains(searchTerm) || 
     a.Mensaje.Contains(searchTerm))
                .OrderByDescending(a => a.FechaCreacion)
     .ToListAsync();

  return avisos.Select(MapToOutputDTO).ToList();
 }

        private void ValidateAviso(AvisoDTO dto)
        {
    if (string.IsNullOrWhiteSpace(dto.Titulo))
       throw new InvalidOperationException("El título es requerido.");

       if (string.IsNullOrWhiteSpace(dto.Mensaje))
      throw new InvalidOperationException("El mensaje es requerido.");

   // Validación de fecha más flexible - permitir fecha actual y futuras
  var fechaEnvio = dto.FechaEnvio;
   var fechaActual = DateTime.Now;
      
      // Permitir fechas desde ahora mismo (con margen de unos minutos para compensar diferencias de tiempo)
            if (fechaEnvio < fechaActual.AddMinutes(-5))
 throw new InvalidOperationException("La fecha de envío no puede ser anterior a la fecha actual.");

     if (dto.MaestroIds == null || !dto.MaestroIds.Any())
         throw new InvalidOperationException("Debe seleccionar al menos un destinatario.");
   }

     // Método para validar que el usuario es admin
    private async Task ValidateUsuarioIsAdminAsync(int usuarioId)
        {
   var usuario = await _context.Usuarios.FindAsync(usuarioId);
     if (usuario == null)
    throw new InvalidOperationException("El usuario no existe.");

 if (usuario.Tipo != UserType.Admin)
       throw new InvalidOperationException("Solo los administradores pueden crear avisos.");
        }

        private async Task ValidateUsuarioExistsAsync(int usuarioId)
        {
   var exists = await _context.Usuarios.AnyAsync(u => u.Id == usuarioId);
   if (!exists)
  throw new InvalidOperationException("El usuario creador no existe.");
     }

        private async Task ValidateMaestrosExistAsync(List<int> maestroIds)
 {
        var existingMaestros = await _context.Usuarios
   .Where(u => maestroIds.Contains(u.Id) && u.Tipo == UserType.Maestro)
 .CountAsync();

            if (existingMaestros != maestroIds.Count)
throw new InvalidOperationException("Uno o más maestros seleccionados no existen o no son válidos.");
 }

 private AvisoOutPutDTO MapToOutputDTO(Aviso aviso)
        {
   return new AvisoOutPutDTO
  {
 Id = aviso.Id,
       Titulo = aviso.Titulo,
   Mensaje = aviso.Mensaje,
  FechaCreacion = aviso.FechaCreacion,
   FechaEnvio = aviso.FechaEnvio,
       Estado = aviso.Estado,
  EstadoDisplay = GetEstadoDisplay(aviso.Estado),
   UsuarioCreadorId = aviso.UsuarioCreadorId,
 UsuarioCreadorNombre = aviso.UsuarioCreador.NombreCompleto,
       Destinatarios = aviso.Destinatarios.Select(d => new AvisoDestinatarioOutPutDTO
    {
          Id = d.Id,
          MaestroId = d.MaestroId,
       MaestroNombre = d.Maestro.NombreCompleto,
       Leido = d.Leido,
  FechaLectura = d.FechaLectura
         }).ToList()
   };
 }

        private string GetEstadoDisplay(EstadoAviso estado)
     {
            return estado switch
{
      EstadoAviso.Programado => "Programado",
  EstadoAviso.Enviado => "Enviado",
   EstadoAviso.Cancelado => "Cancelado",
_ => "N/A"
    };
     }
    }
}