using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaestrosController : ControllerBase
    {
      private readonly IMaestroService _maestroService;

  public MaestrosController(IMaestroService maestroService)
    {
      _maestroService = maestroService;
    }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
    {
           var maestros = await _maestroService.GetAllAsync();
      return Ok(maestros);
  }
            catch (Exception ex)
      {
     return BadRequest(new { message = ex.Message });
   }
   }

     [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
       {
         var maestro = await _maestroService.GetByIdAsync(id);
     if (maestro == null)
      return NotFound(new { message = "Maestro no encontrado." });

              return Ok(maestro);
    }
          catch (Exception ex)
     {
         return BadRequest(new { message = ex.Message });
          }
      }

 [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaestroDTO dto)
        {
            try
            {
        var maestro = await _maestroService.CreateAsync(dto);
    return CreatedAtAction(nameof(GetById), new { id = maestro.Id }, maestro);
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

   [HttpPut("{id}")]
      public async Task<IActionResult> Update(int id, [FromBody] MaestroDTO dto)
   {
   try
            {
 var maestro = await _maestroService.UpdateAsync(id, dto);
      if (maestro == null)
          return NotFound(new { message = "Maestro no encontrado." });

                return Ok(maestro);
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

   [HttpDelete("{id}")]
     public async Task<IActionResult> Delete(int id)
    {
            try
   {
              var deleted = await _maestroService.DeleteAsync(id);
            if (!deleted)
       return NotFound(new { message = "Maestro no encontrado." });

    return Ok(new { message = "Maestro eliminado exitosamente." });
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

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable()
        {
   try
  {
  var maestros = await _maestroService.GetAvailableMaestrosAsync();
         return Ok(maestros);
    }
          catch (Exception ex)
{
     return BadRequest(new { message = ex.Message });
            }
        }

   [HttpGet("by-tipo/{tipo}")]
      public async Task<IActionResult> GetByTipo(CursoType tipo)
        {
 try
   {
      var maestros = await _maestroService.GetMaestrosByTipoAsync(tipo);
                return Ok(maestros);
          }
            catch (Exception ex)
            {
        return BadRequest(new { message = ex.Message });
     }
        }
    }
}