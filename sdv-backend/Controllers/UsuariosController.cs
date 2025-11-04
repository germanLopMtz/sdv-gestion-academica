using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly ILogger<UsuariosController> _logger;

        public UsuariosController(IUsuarioService usuarioService, ILogger<UsuariosController> logger)
        {
            _usuarioService = usuarioService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UsuarioDTO dto)
        {
            var result = await _usuarioService.CreateAsync(dto);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _usuarioService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _usuarioService.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UsuarioDTO dto)
        {
            var result = await _usuarioService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _usuarioService.DeleteAsync(id);
            if (!success) return NotFound();
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("Los datos de login son requeridos");
                }

                if (string.IsNullOrEmpty(dto.CorreoElectronico) || string.IsNullOrEmpty(dto.Contrasena))
                {
                    return BadRequest("El correo electrónico y la contraseña son requeridos");
                }

                var result = await _usuarioService.LoginAsync(dto);
                if (result == null) return Unauthorized("Credenciales inválidas");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar el login para el usuario: {CorreoElectronico}", dto?.CorreoElectronico);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
