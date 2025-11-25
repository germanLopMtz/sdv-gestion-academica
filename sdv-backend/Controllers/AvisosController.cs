using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AvisosController : ControllerBase
 {
  private readonly IAvisoService _avisoService;
        private readonly ILogger<AvisosController> _logger;

   public AvisosController(IAvisoService avisoService, ILogger<AvisosController> logger)
  {
  _avisoService = avisoService;
   _logger = logger;
        }

   [HttpGet]
   public async Task<IActionResult> GetAll()
 {
  try
  {
   var avisos = await _avisoService.GetAllAsync();
    return Ok(avisos);
  }
    catch (Exception ex)
   {
    _logger.LogError(ex, "Error al obtener todos los avisos");
  return BadRequest(new { message = ex.Message });
   }
 }

        [HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
   {
       try
   {
  var aviso = await _avisoService.GetByIdAsync(id);
if (aviso == null)
      return NotFound(new { message = "Aviso no encontrado." });

     return Ok(aviso);
     }
        catch (Exception ex)
    {
    _logger.LogError(ex, "Error al obtener el aviso {Id}", id);
       return BadRequest(new { message = ex.Message });
            }
}

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AvisoDTO dto, [FromQuery] int usuarioCreadorId)
     {
            try
{
       // Validar que se proporcione el usuarioCreadorId
    if (usuarioCreadorId <= 0)
       return BadRequest(new { message = "El ID del usuario creador es requerido." });

var aviso = await _avisoService.CreateAsync(dto, usuarioCreadorId);
   return CreatedAtAction(nameof(GetById), new { id = aviso.Id }, aviso);
     }
  catch (InvalidOperationException ex)
 {
        return BadRequest(new { message = ex.Message });
   }
  catch (Exception ex)
    {
       _logger.LogError(ex, "Error al crear el aviso");
return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
        }
 }

[HttpPut("{id}")]
  public async Task<IActionResult> Update(int id, [FromBody] AvisoDTO dto)
        {
      try
  {
   var aviso = await _avisoService.UpdateAsync(id, dto);
        if (aviso == null)
        return NotFound(new { message = "Aviso no encontrado." });

            return Ok(aviso);
    }
       catch (InvalidOperationException ex)
 {
return BadRequest(new { message = ex.Message });
   }
  catch (Exception ex)
     {
       _logger.LogError(ex, "Error al actualizar el aviso {Id}", id);
       return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
            }
        }

      [HttpDelete("{id}")]
 public async Task<IActionResult> Delete(int id)
        {
   try
        {
var deleted = await _avisoService.DeleteAsync(id);
if (!deleted)
       return NotFound(new { message = "Aviso no encontrado." });

return Ok(new { message = "Aviso eliminado exitosamente." });
        }
     catch (InvalidOperationException ex)
     {
     return BadRequest(new { message = ex.Message });
     }
            catch (Exception ex)
  {
       _logger.LogError(ex, "Error al eliminar el aviso {Id}", id);
  return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
 }
  }

[HttpGet("estado/{estado}")]
      public async Task<IActionResult> GetByEstado(EstadoAviso estado)
  {
   try
{
        var avisos = await _avisoService.GetByEstadoAsync(estado);
      return Ok(avisos);
        }
 catch (Exception ex)
        {
  _logger.LogError(ex, "Error al obtener avisos por estado {Estado}", estado);
     return BadRequest(new { message = ex.Message });
   }
  }

 [HttpGet("maestro/{maestroId}")]
     public async Task<IActionResult> GetByMaestro(int maestroId)
 {
       try
  {
            var avisos = await _avisoService.GetByMaestroAsync(maestroId);
       return Ok(avisos);
   }
      catch (Exception ex)
   {
        _logger.LogError(ex, "Error al obtener avisos para el maestro {MaestroId}", maestroId);
       return BadRequest(new { message = ex.Message });
      }
}

 [HttpPost("{id}/enviar")]
        public async Task<IActionResult> EnviarAviso(int id, [FromQuery] int usuarioId)
  {
try
{
 // Validar que se proporcione el usuarioId
      if (usuarioId <= 0)
    return BadRequest(new { message = "El ID del usuario es requerido para enviar el aviso." });

var success = await _avisoService.EnviarAvisoAsync(id, usuarioId);
   if (!success)
     return NotFound(new { message = "Aviso no encontrado." });

     return Ok(new { message = "Aviso enviado exitosamente." });
 }
     catch (InvalidOperationException ex)
      {
     return BadRequest(new { message = ex.Message });
      }
  catch (Exception ex)
   {
      _logger.LogError(ex, "Error al enviar el aviso {Id}", id);
        return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
 }
 }

        [HttpPost("{id}/cancelar")]
 public async Task<IActionResult> CancelarAviso(int id)
        {
 try
 {
     var success = await _avisoService.CancelarAvisoAsync(id);
if (!success)
 return NotFound(new { message = "Aviso no encontrado." });

      return Ok(new { message = "Aviso cancelado exitosamente." });
  }
      catch (InvalidOperationException ex)
   {
  return BadRequest(new { message = ex.Message });
     }
        catch (Exception ex)
  {
          _logger.LogError(ex, "Error al cancelar el aviso {Id}", id);
       return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
    }
    }

  [HttpPost("{avisoId}/marcar-leido/{maestroId}")]
   public async Task<IActionResult> MarcarComoLeido(int avisoId, int maestroId)
     {
  try
{
       var success = await _avisoService.MarcarComoLeidoAsync(avisoId, maestroId);
   if (!success)
   return NotFound(new { message = "Aviso o maestro no encontrado." });

      return Ok(new { message = "Aviso marcado como leído." });
 }
        catch (Exception ex)
        {
    _logger.LogError(ex, "Error al marcar como leído el aviso {AvisoId} para el maestro {MaestroId}", avisoId, maestroId);
      return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
     }
 }

 [HttpGet("buscar")]
        public async Task<IActionResult> Search([FromQuery] string searchTerm)
        {
try
  {
        var avisos = await _avisoService.SearchAsync(searchTerm);
     return Ok(avisos);
   }
  catch (Exception ex)
   {
   _logger.LogError(ex, "Error al buscar avisos con término: {SearchTerm}", searchTerm);
        return BadRequest(new { message = ex.Message });
 }
 }
    }
}