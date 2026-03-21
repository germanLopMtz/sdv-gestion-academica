using Microsoft.EntityFrameworkCore;
using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Infraestructure.API_Services
{
    public class AsistenciaService : IAsistenciaService
    {
        private readonly AppDBContext _context;

        public AsistenciaService(AppDBContext context)
        {
            _context = context;
        }

        public async Task<AsistenciaOutPutDTO> RegistrarAsistenciaAsync(AsistenciaDTO dto)
        {
            var clase = await _context.ClassSchedules
                .Include(cs => cs.Room)
                .Include(cs => cs.TimeSlot)
                .Include(cs => cs.Maestro)
                .Include(cs => cs.ClassStudents)
                    .ThenInclude(cs => cs.Alumno)
                .FirstOrDefaultAsync(cs => cs.Id == dto.ClassScheduleId)
                ?? throw new InvalidOperationException("La clase no existe.");

            var fechaNormalizada = dto.Fecha.Date;

            // Eliminar asistencias previas del mismo día para esa clase (permite re-registrar)
            var existentes = await _context.Attendances
                .Where(a => a.ClassScheduleId == dto.ClassScheduleId && a.Date == fechaNormalizada)
                .ToListAsync();

            if (existentes.Count > 0)
            {
                _context.Attendances.RemoveRange(existentes);
            }

            // Obtener los alumnos inscritos en la clase
            var alumnosInscritos = clase.ClassStudents.Select(cs => cs.AlumnoId).ToHashSet();

            // Registrar asistencias solo para alumnos inscritos
            foreach (var asistencia in dto.Asistencias)
            {
                if (!alumnosInscritos.Contains(asistencia.AlumnoId))
                {
                    continue;
                }

                _context.Attendances.Add(new Attendance
                {
                    ClassScheduleId = dto.ClassScheduleId,
                    AlumnoId = asistencia.AlumnoId,
                    Date = fechaNormalizada,
                    Status = asistencia.Status
                });
            }

            await _context.SaveChangesAsync();

            return await BuildOutputAsync(clase, fechaNormalizada);
        }

        public async Task<AsistenciaOutPutDTO?> GetByClaseYFechaAsync(int classScheduleId, DateTime fecha)
        {
            var clase = await _context.ClassSchedules
                .Include(cs => cs.Room)
                .Include(cs => cs.TimeSlot)
                .Include(cs => cs.Maestro)
                .Include(cs => cs.ClassStudents)
                    .ThenInclude(cs => cs.Alumno)
                .FirstOrDefaultAsync(cs => cs.Id == classScheduleId);

            if (clase == null)
            {
                return null;
            }

            return await BuildOutputAsync(clase, fecha.Date);
        }

        public async Task<List<AsistenciaOutPutDTO>> GetByClaseAsync(int classScheduleId)
        {
            var clase = await _context.ClassSchedules
                .Include(cs => cs.Room)
                .Include(cs => cs.TimeSlot)
                .Include(cs => cs.Maestro)
                .Include(cs => cs.ClassStudents)
                    .ThenInclude(cs => cs.Alumno)
                .FirstOrDefaultAsync(cs => cs.Id == classScheduleId);

            if (clase == null)
            {
                return new List<AsistenciaOutPutDTO>();
            }

            var fechas = await _context.Attendances
                .Where(a => a.ClassScheduleId == classScheduleId)
                .Select(a => a.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToListAsync();

            var resultado = new List<AsistenciaOutPutDTO>();
            foreach (var fecha in fechas)
            {
                resultado.Add(await BuildOutputAsync(clase, fecha));
            }

            return resultado;
        }

        public async Task<List<StudentAttendanceDTO>> GetAlumnosByClaseAsync(int classScheduleId)
        {
            var alumnos = await _context.ClassStudents
                .Where(cs => cs.ClassScheduleId == classScheduleId)
                .Include(cs => cs.Alumno)
                .Select(cs => new StudentAttendanceDTO
                {
                    AlumnoId = cs.AlumnoId,
                    Nombre = cs.Alumno.NombreCompleto,
                    Asistencia = string.Empty
                })
                .ToListAsync();

            return alumnos;
        }

        public async Task<List<HistorialAsistenciaDTO>> GetHistorialByClaseAsync(int classScheduleId)
        {
            var registros = await _context.Attendances
                .Where(a => a.ClassScheduleId == classScheduleId)
                .Include(a => a.Alumno)
                .OrderByDescending(a => a.Date)
                .ThenBy(a => a.Alumno.NombreCompleto)
                .Select(a => new HistorialAsistenciaDTO
                {
                    Fecha = a.Date,
                    AlumnoId = a.AlumnoId,
                    NombreAlumno = a.Alumno.NombreCompleto,
                    EstadoCodigo = a.Status.ToString(),
                    Estado = a.Status == AttendanceStatus.S ? "Sí asistió"
                           : a.Status == AttendanceStatus.N ? "No asistió"
                           : a.Status == AttendanceStatus.J ? "Justificado"
                           : "Sin registro"
                })
                .ToListAsync();

            return registros;
        }

        private async Task<AsistenciaOutPutDTO> BuildOutputAsync(ClassSchedule clase, DateTime fecha)
        {
            var asistencias = await _context.Attendances
                .Where(a => a.ClassScheduleId == clase.Id && a.Date == fecha)
                .ToListAsync();

            var alumnosOutput = clase.ClassStudents.Select(cs =>
            {
                var asistencia = asistencias.FirstOrDefault(a => a.AlumnoId == cs.AlumnoId);
                return new StudentAttendanceDTO
                {
                    AlumnoId = cs.AlumnoId,
                    Nombre = cs.Alumno.NombreCompleto,
                    Asistencia = asistencia != null ? asistencia.Status.ToString() : string.Empty
                };
            }).ToList();

            return new AsistenciaOutPutDTO
            {
                Id = clase.Id,
                ClassScheduleId = clase.Id,
                Curso = clase.TipoDeCurso.ToString(),
                Aula = clase.Room?.Name ?? string.Empty,
                Fecha = fecha,
                Docente = clase.Maestro?.NombreCompleto ?? string.Empty,
                Alumnos = alumnosOutput
            };
        }
    }
}
