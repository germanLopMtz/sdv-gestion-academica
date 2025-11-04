using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlumnosController : ControllerBase
    {
        private readonly IAlumnoService _alumnoService;

        public AlumnosController(IAlumnoService alumnoService)
        {
            _alumnoService = alumnoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var alumnos = await _alumnoService.GetAllAsync();
                return Ok(alumnos);
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
                var alumno = await _alumnoService.GetByIdAsync(id);
                if (alumno == null)
                    return NotFound(new { message = "Alumno no encontrado." });

                return Ok(alumno);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AlumnosDTO dto)
        {
            try
            {
                var alumno = await _alumnoService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = alumno.Id }, alumno);
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
        public async Task<IActionResult> Update(int id, [FromBody] AlumnosDTO dto)
        {
            try
            {
                var alumno = await _alumnoService.UpdateAsync(id, dto);
                if (alumno == null)
                    return NotFound(new { message = "Alumno no encontrado." });

                return Ok(alumno);
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
                var deleted = await _alumnoService.DeleteAsync(id);
                if (!deleted)
                    return NotFound(new { message = "Alumno no encontrado." });

                return Ok(new { message = "Alumno eliminado exitosamente." });
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
                var alumnos = await _alumnoService.GetAvailableAlumnosAsync();
                return Ok(alumnos);
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
                var alumnos = await _alumnoService.GetAlumnosByTipoAsync(tipo);
                return Ok(alumnos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
