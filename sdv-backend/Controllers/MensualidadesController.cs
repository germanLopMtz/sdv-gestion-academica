using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MensualidadesController : ControllerBase
    {
        private readonly IMensualidadService _mensualidadService;

        public MensualidadesController(IMensualidadService mensualidadService)
        {
            _mensualidadService = mensualidadService;
        }

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

        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen([FromQuery] int? año)
        {
            try
            {
                var resumen = await _mensualidadService.GetResumenAsync(año);
                return Ok(resumen);
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

        [HttpGet("alumno/{alumnoId}")]
        public async Task<IActionResult> GetByAlumno(int alumnoId, [FromQuery] int? año)
        {
            try
            {
                var mensualidades = await _mensualidadService.GetByAlumnoAsync(alumnoId, año);
                return Ok(mensualidades);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mes/{mes}/año/{año}")]
        public async Task<IActionResult> GetByMes(Mes mes, int año)
        {
            try
            {
                var mensualidades = await _mensualidadService.GetByMesAsync(mes, año);
                return Ok(mensualidades);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("estado/{estado}")]
        public async Task<IActionResult> GetByEstado(EstadoPago estado, [FromQuery] int? año)
        {
            try
            {
                var mensualidades = await _mensualidadService.GetByEstadoAsync(estado, año);
                return Ok(mensualidades);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> Buscar([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return BadRequest(new { message = "El término de búsqueda es requerido." });

                var mensualidades = await _mensualidadService.BuscarAsync(searchTerm);
                return Ok(mensualidades);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

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
    }
}

