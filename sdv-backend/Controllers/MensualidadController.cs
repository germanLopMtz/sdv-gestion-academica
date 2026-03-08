using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    /// <summary>
    /// Controller para gestión de mensualidades
    /// </summary>
  [ApiController]
    [Route("api/[controller]")]
    public class MensualidadController : ControllerBase
    {
        private readonly IMensualidadService _mensualidadService;

        public MensualidadController(IMensualidadService mensualidadService)
        {
            _mensualidadService = mensualidadService;
    }

        /// <summary>
        /// Obtiene todas las mensualidades
  /// </summary>
        [HttpGet]
     public async Task<IActionResult> GetAll()
    {
            try
            {
     var mensualidades = await _mensualidadService.GetAllAsync();
   return Ok(mensualidades);
  }
  catch (Exception ex)
     {
           return BadRequest(new { message = ex.Message });
            }
        }

   /// <summary>
        /// Obtiene una mensualidad por ID
        /// </summary>
   [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
    var mensualidad = await _mensualidadService.GetByIdAsync(id);
   if (mensualidad == null)
         return NotFound(new { message = "Mensualidad no encontrada." });

   return Ok(mensualidad);
            }
      catch (Exception ex)
        {
       return BadRequest(new { message = ex.Message });
            }
  }

        /// <summary>
        /// Registra un nuevo pago de mensualidad
        /// </summary>
        [HttpPost]
    public async Task<IActionResult> Create([FromBody] MensualidadDTO dto)
        {
            try
     {
     var mensualidad = await _mensualidadService.CreateAsync(dto);
    return CreatedAtAction(nameof(GetById), new { id = mensualidad.Id }, mensualidad);
   }
        catch (InvalidOperationException ex)
            {
      return BadRequest(new { message = ex.Message });
}
            catch (Exception ex)
        {
  return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
         }
        }

     /// <summary>
        /// Actualiza un pago de mensualidad existente
  /// </summary>
     [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MensualidadDTO dto)
        {
            try
            {
     var mensualidad = await _mensualidadService.UpdateAsync(id, dto);
         if (mensualidad == null)
      return NotFound(new { message = "Mensualidad no encontrada." });

  return Ok(mensualidad);
         }
 catch (InvalidOperationException ex)
            {
        return BadRequest(new { message = ex.Message });
         }
        catch (Exception ex)
            {
        return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Elimina un registro de mensualidad
        /// </summary>
        [HttpDelete("{id}")]
   public async Task<IActionResult> Delete(int id)
        {
  try
            {
    var deleted = await _mensualidadService.DeleteAsync(id);
    if (!deleted)
  return NotFound(new { message = "Mensualidad no encontrada." });

         return Ok(new { message = "Mensualidad eliminada exitosamente." });
            }
  catch (Exception ex)
 {
     return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene las mensualidades de un alumno específico
        /// </summary>
 [HttpGet("alumno/{alumnoId}")]
      public async Task<IActionResult> GetByAlumnoId(int alumnoId)
    {
          try
     {
        var mensualidades = await _mensualidadService.GetByAlumnoIdAsync(alumnoId);
                return Ok(mensualidades);
     }
          catch (Exception ex)
          {
         return BadRequest(new { message = ex.Message });
            }
  }

        /// <summary>
     /// Obtiene el resumen de mensualidades por alumno (para la vista principal)
        /// </summary>
        [HttpGet("resumen")]
      public async Task<IActionResult> GetResumen()
        {
   try
            {
  var resumen = await _mensualidadService.GetResumenMensualidadesAsync();
    return Ok(resumen);
          }
            catch (Exception ex)
         {
       return BadRequest(new { message = ex.Message });
        }
        }

    /// <summary>
        /// Obtiene mensualidades filtradas por mes
        /// </summary>
        [HttpGet("mes/{mes}")]
   public async Task<IActionResult> GetByMes(string mes)
      {
            try
 {
      var mensualidades = await _mensualidadService.GetByMesAsync(mes.ToUpper());
     return Ok(mensualidades);
            }
            catch (Exception ex)
       {
      return BadRequest(new { message = ex.Message });
  }
    }

   /// <summary>
      /// Obtiene mensualidades filtradas por estado (PAGADO, PENDIENTE)
        /// </summary>
        [HttpGet("estado/{estado}")]
        public async Task<IActionResult> GetByEstado(string estado)
        {
try
            {
         var mensualidades = await _mensualidadService.GetByEstadoAsync(estado.ToUpper());
       return Ok(mensualidades);
            }
       catch (Exception ex)
      {
           return BadRequest(new { message = ex.Message });
      }
}
    }
}
