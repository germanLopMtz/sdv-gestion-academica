using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlumnosController : Controller
    {
        private readonly IAlumnoService _alumnoService;

        public AlumnosController(IAlumnoService AlumnoService)
        {
            _alumnoService = AlumnoService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AlumnosDTO dto)
        {
            var result = await _alumnoService.CreateAsync(dto);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _alumnoService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _alumnoService.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AlumnosDTO dto)
        {
            var result = await _alumnoService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _alumnoService.DeleteAsync(id);
            if (!success) return NotFound();
            return Ok();
        }

    }
}
