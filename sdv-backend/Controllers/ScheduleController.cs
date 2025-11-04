using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Infraestructure.API_Service_Interfaces;
using sdv_backend.Data.Entities;

namespace sdv_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClassScheduleDTO dto)
        {
            try
            {
                // TODO: Validar que el usuario es Admin (cuando se implemente autenticación/autorización)
                var result = await _scheduleService.CreateAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _scheduleService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _scheduleService.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ClassScheduleDTO dto)
        {
            try
            {
                // TODO: Validar que el usuario es Admin (cuando se implemente autenticación/autorización)
                var result = await _scheduleService.UpdateAsync(id, dto);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // TODO: Validar que el usuario es Admin (cuando se implemente autenticación/autorización)
                var success = await _scheduleService.DeleteAsync(id);
                if (!success) return NotFound();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("rooms")]
        public async Task<IActionResult> GetRooms()
        {
            var result = await _scheduleService.GetRoomsAsync();
            return Ok(result);
        }

        [HttpGet("timeslots")]
        public async Task<IActionResult> GetTimeSlots()
        {
            var result = await _scheduleService.GetTimeSlotsAsync();
            return Ok(result);
        }
    }
}

