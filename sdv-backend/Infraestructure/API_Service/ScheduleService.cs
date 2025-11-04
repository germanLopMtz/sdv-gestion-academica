using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure.API_Service_Interfaces;

namespace sdv_backend.Infraestructure.API_Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly AppDBContext _context;

        public ScheduleService(AppDBContext context)
        {
            _context = context;
        }

        public async Task<ClassScheduleOutPutDTO> CreateAsync(ClassScheduleDTO dto)
        {
            // Validaciones de negocio
            ValidateSchedule(dto);

            // Verificar que el maestro existe y es de tipo Maestro
            var maestro = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == dto.MaestroId && u.Tipo == UserType.Maestro);
            
            if (maestro == null)
                throw new InvalidOperationException("El maestro seleccionado no existe o no es válido.");

            // Verificar que los alumnos existen
            var alumnos = await _context.Alumnos
                .Where(a => dto.AlumnoIds.Contains(a.Id))
                .ToListAsync();

            if (alumnos.Count != dto.AlumnoIds.Count)
                throw new InvalidOperationException("Uno o más alumnos seleccionados no existen.");

            // Validar cupo máximo
            var maxCapacity = dto.TipoDeCurso == CursoType.Seminario ? 12 : 5;
            if (dto.AlumnoIds.Count > maxCapacity)
                throw new InvalidOperationException(
                    $"El cupo máximo para {dto.TipoDeCurso} es de {maxCapacity} alumnos. Se intentó registrar {dto.AlumnoIds.Count}.");

            // Validar choques de maestro
            var maestroConflict = await _context.ClassSchedules
                .AnyAsync(cs => cs.MaestroId == dto.MaestroId 
                    && cs.DayOfWeek == dto.DayOfWeek 
                    && cs.TimeSlotId == dto.TimeSlotId);

            if (maestroConflict)
                throw new InvalidOperationException("El maestro ya tiene una clase asignada en este horario y día.");

            // Validar choques de aula
            var roomConflict = await _context.ClassSchedules
                .AnyAsync(cs => cs.RoomId == dto.RoomId 
                    && cs.DayOfWeek == dto.DayOfWeek 
                    && cs.TimeSlotId == dto.TimeSlotId);

            if (roomConflict)
                throw new InvalidOperationException("El aula ya está ocupada en este horario y día.");

            // Crear la clase
            var classSchedule = new ClassSchedule
            {
                RoomId = dto.RoomId,
                TimeSlotId = dto.TimeSlotId,
                MaestroId = dto.MaestroId,
                DayOfWeek = dto.DayOfWeek,
                Modalidad = dto.Modalidad,
                TipoDeCurso = dto.TipoDeCurso,
                CreatedAt = DateTime.UtcNow
            };

            _context.ClassSchedules.Add(classSchedule);
            await _context.SaveChangesAsync();

            // Agregar alumnos
            foreach (var alumnoId in dto.AlumnoIds)
            {
                var classStudent = new ClassStudent
                {
                    ClassScheduleId = classSchedule.Id,
                    AlumnoId = alumnoId,
                    EnrolledAt = DateTime.UtcNow
                };
                _context.ClassStudents.Add(classStudent);
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(classSchedule.Id) ?? throw new Exception("Error al recuperar el horario creado.");
        }

        public async Task<ClassScheduleOutPutDTO?> GetByIdAsync(int id)
        {
            var classSchedule = await _context.ClassSchedules
                .Include(cs => cs.Room)
                .Include(cs => cs.TimeSlot)
                .Include(cs => cs.Maestro)
                .Include(cs => cs.ClassStudents)
                    .ThenInclude(cs => cs.Alumno)
                .FirstOrDefaultAsync(cs => cs.Id == id);

            if (classSchedule == null) return null;

            return MapToOutputDTO(classSchedule);
        }

        public async Task<List<ClassScheduleOutPutDTO>> GetAllAsync()
        {
            var classSchedules = await _context.ClassSchedules
                .Include(cs => cs.Room)
                .Include(cs => cs.TimeSlot)
                .Include(cs => cs.Maestro)
                .Include(cs => cs.ClassStudents)
                    .ThenInclude(cs => cs.Alumno)
                .OrderBy(cs => cs.DayOfWeek)
                .ThenBy(cs => cs.TimeSlot.StartTime)
                .ToListAsync();

            return classSchedules.Select(MapToOutputDTO).ToList();
        }

        public async Task<ClassScheduleOutPutDTO?> UpdateAsync(int id, ClassScheduleDTO dto)
        {
            var classSchedule = await _context.ClassSchedules
                .Include(cs => cs.ClassStudents)
                .FirstOrDefaultAsync(cs => cs.Id == id);

            if (classSchedule == null) return null;

            // Validaciones de negocio
            ValidateSchedule(dto);

            // Verificar que el maestro existe y es de tipo Maestro
            var maestro = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == dto.MaestroId && u.Tipo == UserType.Maestro);
            
            if (maestro == null)
                throw new InvalidOperationException("El maestro seleccionado no existe o no es válido.");

            // Verificar que los alumnos existen
            var alumnos = await _context.Alumnos
                .Where(a => dto.AlumnoIds.Contains(a.Id))
                .ToListAsync();

            if (alumnos.Count != dto.AlumnoIds.Count)
                throw new InvalidOperationException("Uno o más alumnos seleccionados no existen.");

            // Validar cupo máximo
            var maxCapacity = dto.TipoDeCurso == CursoType.Seminario ? 12 : 5;
            if (dto.AlumnoIds.Count > maxCapacity)
                throw new InvalidOperationException(
                    $"El cupo máximo para {dto.TipoDeCurso} es de {maxCapacity} alumnos. Se intentó registrar {dto.AlumnoIds.Count}.");

            // Validar choques de maestro (excluyendo el horario actual)
            var maestroConflict = await _context.ClassSchedules
                .AnyAsync(cs => cs.MaestroId == dto.MaestroId 
                    && cs.DayOfWeek == dto.DayOfWeek 
                    && cs.TimeSlotId == dto.TimeSlotId
                    && cs.Id != id);

            if (maestroConflict)
                throw new InvalidOperationException("El maestro ya tiene una clase asignada en este horario y día.");

            // Validar choques de aula (excluyendo el horario actual)
            var roomConflict = await _context.ClassSchedules
                .AnyAsync(cs => cs.RoomId == dto.RoomId 
                    && cs.DayOfWeek == dto.DayOfWeek 
                    && cs.TimeSlotId == dto.TimeSlotId
                    && cs.Id != id);

            if (roomConflict)
                throw new InvalidOperationException("El aula ya está ocupada en este horario y día.");

            // Actualizar propiedades
            classSchedule.RoomId = dto.RoomId;
            classSchedule.TimeSlotId = dto.TimeSlotId;
            classSchedule.MaestroId = dto.MaestroId;
            classSchedule.DayOfWeek = dto.DayOfWeek;
            classSchedule.Modalidad = dto.Modalidad;
            classSchedule.TipoDeCurso = dto.TipoDeCurso;

            // Actualizar alumnos: eliminar los que ya no están y agregar los nuevos
            var existingAlumnoIds = classSchedule.ClassStudents.Select(cs => cs.AlumnoId).ToList();
            var toRemove = existingAlumnoIds.Except(dto.AlumnoIds).ToList();
            var toAdd = dto.AlumnoIds.Except(existingAlumnoIds).ToList();

            foreach (var alumnoId in toRemove)
            {
                var classStudent = classSchedule.ClassStudents.First(cs => cs.AlumnoId == alumnoId);
                _context.ClassStudents.Remove(classStudent);
            }

            foreach (var alumnoId in toAdd)
            {
                var classStudent = new ClassStudent
                {
                    ClassScheduleId = classSchedule.Id,
                    AlumnoId = alumnoId,
                    EnrolledAt = DateTime.UtcNow
                };
                _context.ClassStudents.Add(classStudent);
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var classSchedule = await _context.ClassSchedules.FindAsync(id);
            if (classSchedule == null) return false;

            _context.ClassSchedules.Remove(classSchedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Room>> GetRoomsAsync()
        {
            return await _context.Rooms.OrderBy(r => r.Name).ToListAsync();
        }

        public async Task<List<TimeSlot>> GetTimeSlotsAsync()
        {
            return await _context.TimeSlots.OrderBy(ts => ts.StartTime).ToListAsync();
        }

        private ClassScheduleOutPutDTO MapToOutputDTO(ClassSchedule cs)
        {
            var maxCapacity = cs.TipoDeCurso == CursoType.Seminario ? 12 : 5;
            
            return new ClassScheduleOutPutDTO
            {
                Id = cs.Id,
                RoomId = cs.RoomId,
                RoomName = cs.Room.Name,
                TimeSlotId = cs.TimeSlotId,
                TimeSlotDisplay = cs.TimeSlot.DisplayName,
                MaestroId = cs.MaestroId,
                MaestroName = cs.Maestro.NombreCompleto,
                DayOfWeek = cs.DayOfWeek,
                DayOfWeekDisplay = GetDayOfWeekDisplay(cs.DayOfWeek),
                Modalidad = cs.Modalidad,
                ModalidadDisplay = GetModalidadDisplay(cs.Modalidad),
                TipoDeCurso = cs.TipoDeCurso,
                TipoDeCursoDisplay = GetTipoDeCursoDisplay(cs.TipoDeCurso),
                Alumnos = cs.ClassStudents.Select(cst => new ClassStudentOutPutDTO
                {
                    Id = cst.Id,
                    AlumnoId = cst.AlumnoId,
                    AlumnoName = cst.Alumno.NombreCompleto,
                    EnrolledAt = cst.EnrolledAt
                }).ToList(),
                CurrentCapacity = cs.ClassStudents.Count,
                MaxCapacity = maxCapacity,
                CreatedAt = cs.CreatedAt
            };
        }

        private void ValidateSchedule(ClassScheduleDTO dto)
        {
            // Validar que el aula existe
            if (!_context.Rooms.Any(r => r.Id == dto.RoomId))
                throw new InvalidOperationException("El aula seleccionada no existe.");

            // Validar que el horario existe
            if (!_context.TimeSlots.Any(ts => ts.Id == dto.TimeSlotId))
                throw new InvalidOperationException("El horario seleccionado no existe.");

            // Validar día de la semana
            if (dto.DayOfWeek == Domain.Enum.DayOfWeek.None)
                throw new InvalidOperationException("Debe seleccionar un día de la semana válido.");

            // Validar que no sea viernes o sábado con horario 8-10
            var timeSlot = _context.TimeSlots.FirstOrDefault(ts => ts.Id == dto.TimeSlotId);
            if (timeSlot != null && timeSlot.StartTime == "20:00" && 
                (dto.DayOfWeek == Domain.Enum.DayOfWeek.Viernes || dto.DayOfWeek == Domain.Enum.DayOfWeek.Sabado))
            {
                throw new InvalidOperationException("No se permiten clases de 8:00-10:00 PM los viernes y sábados.");
            }

            // Validar modalidad
            if (dto.Modalidad == ModalidadCurso.None)
                throw new InvalidOperationException("Debe seleccionar una modalidad válida.");

            // Validar tipo de curso
            if (dto.TipoDeCurso == CursoType.None)
                throw new InvalidOperationException("Debe seleccionar un tipo de curso válido.");
        }

        private string GetDayOfWeekDisplay(Domain.Enum.DayOfWeek day)
        {
            return day switch
            {
                Domain.Enum.DayOfWeek.Lunes => "Lunes",
                Domain.Enum.DayOfWeek.Martes => "Martes",
                Domain.Enum.DayOfWeek.Miercoles => "Miércoles",
                Domain.Enum.DayOfWeek.Jueves => "Jueves",
                Domain.Enum.DayOfWeek.Viernes => "Viernes",
                Domain.Enum.DayOfWeek.Sabado => "Sábado",
                _ => "N/A"
            };
        }

        private string GetModalidadDisplay(ModalidadCurso modalidad)
        {
            return modalidad switch
            {
                ModalidadCurso.Presencial => "Presencial",
                ModalidadCurso.Virtual => "Virtual",
                _ => "N/A"
            };
        }

        private string GetTipoDeCursoDisplay(CursoType tipo)
        {
            return tipo switch
            {
                CursoType.Seminario => "Seminario",
                CursoType.Diplomado => "Diplomado",
                _ => "N/A"
            };
        }
    }
}

