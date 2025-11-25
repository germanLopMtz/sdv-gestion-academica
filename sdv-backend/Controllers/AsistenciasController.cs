using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Data;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum; 
using sdv_backend.Data.DataDB;


namespace sdv_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AsistenciasController : ControllerBase
    {
        private readonly AppDBContext _context;

        public AsistenciasController(AppDBContext context)
        {
            _context = context;
        }

        // GET api/Asistencias/clases-del-dia?fecha=2025-11-24
        [HttpGet("clases-del-dia")]
        public async Task<ActionResult<IEnumerable<ClassOfDayDto>>> GetClasesDelDia([FromQuery] DateTime fecha)
        {
            var dayOfWeek = (Dias)fecha.DayOfWeek; // ajusta si tu enum Dias no coincide

            var schedules = await _context.ClassSchedules
                .Include(cs => cs.Room)
                .Include(cs => cs.TimeSlot)
                .Include(cs => cs.Maestro)
                .Include(cs => cs.ClassStudents)
                    .ThenInclude(cs => cs.Alumno)
                .Where(cs => cs.DayOfWeek == dayOfWeek)
                .ToListAsync();

            var attendances = await _context.Attendances
                .Where(a => a.Date.Date == fecha.Date)
                .ToListAsync();

            var result = schedules.Select(cs => new ClassOfDayDto
            {
                Id = cs.Id,
                Dia = cs.DayOfWeek.ToString(),
                Curso = cs.TipoDeCurso.ToString(), // o el nombre real del curso
                Horario = $"{cs.TimeSlot.StartTime:hh\\:mm} - {cs.TimeSlot.EndTime:hh\\:mm}", 
                Aula = cs.Room.Name,
                Docente = cs.Maestro.NombreCompleto, // ajusta al campo real
                Cargo = cs.Maestro.Tipo.ToString(),              // o "Profesor/Director/Coordinador"
                Alumnos = cs.ClassStudents.Select(csAl =>
                {
                    var att = attendances.FirstOrDefault(a =>
                        a.ClassScheduleId == cs.Id &&
                        a.AlumnoId == csAl.AlumnoId);

                    return new StudentAttendanceDto
                    {
                        AlumnoId = csAl.AlumnoId,
                        Nombre = csAl.Alumno.NombreCompleto, // ajusta
                        Asistencia = att == null ? null : att.Status.ToString()
                    };
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        // POST api/Asistencias
        [HttpPost]
        public async Task<IActionResult> SaveAttendance([FromBody] SaveAttendanceDto dto)
        {
            var fecha = dto.Fecha.Date;

            var existing = await _context.Attendances
                .Where(a => a.ClassScheduleId == dto.ClassScheduleId && a.Date == fecha)
                .ToListAsync();

            // eliminar los registros existentes y recrearlos (más simple)
            if (existing.Any())
            {
                _context.Attendances.RemoveRange(existing);
            }

            var newRecords = dto.Alumnos
                .Where(a => !string.IsNullOrEmpty(a.Asistencia))
                .Select(a => new Attendance
                {
                    ClassScheduleId = dto.ClassScheduleId,
                    AlumnoId = a.AlumnoId,
                    Date = fecha,
                    Status = Enum.Parse<AttendanceStatus>(a.Asistencia!)
                }).ToList();

            await _context.Attendances.AddRangeAsync(newRecords);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
