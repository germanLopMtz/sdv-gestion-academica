using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    /// <summary>
    /// Controller para gestión de asistencias
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AsistenciaController : ControllerBase
    {
        private readonly IAsistenciaService _asistenciaService;

        public AsistenciaController(IAsistenciaService asistenciaService)
        {
            _asistenciaService = asistenciaService;
        }

        /// <summary>
        /// Obtiene los alumnos inscritos en una clase (para mostrar la lista antes de registrar)
        /// </summary>
        [HttpGet("clase/{classScheduleId}/alumnos")]
        public async Task<IActionResult> GetAlumnosByClase(int classScheduleId)
        {
            try
            {
                var alumnos = await _asistenciaService.GetAlumnosByClaseAsync(classScheduleId);
                return Ok(alumnos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Registra o actualiza la asistencia de una clase en una fecha específica
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> RegistrarAsistencia([FromBody] AsistenciaDTO dto)
        {
            try
            {
                var resultado = await _asistenciaService.RegistrarAsistenciaAsync(dto);
                return Ok(resultado);
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
        /// Obtiene la asistencia de una clase en una fecha específica
        /// </summary>
        [HttpGet("clase/{classScheduleId}/fecha/{fecha}")]
        public async Task<IActionResult> GetByClaseYFecha(int classScheduleId, DateTime fecha)
        {
            try
            {
                var resultado = await _asistenciaService.GetByClaseYFechaAsync(classScheduleId, fecha);
                if (resultado == null)
                {
                    return NotFound(new { message = "No se encontró asistencia para esa clase y fecha." });
                }
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el historial de asistencias de una clase
        /// </summary>
        [HttpGet("clase/{classScheduleId}")]
        public async Task<IActionResult> GetByClase(int classScheduleId)
        {
            try
            {
                var resultado = await _asistenciaService.GetByClaseAsync(classScheduleId);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el historial de asistencias de una clase (fecha, alumno y estado)
        /// </summary>
        [HttpGet("clase/{classScheduleId}/historial")]
        public async Task<IActionResult> GetHistorial(int classScheduleId)
        {
            try
            {
                var resultado = await _asistenciaService.GetHistorialByClaseAsync(classScheduleId);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
