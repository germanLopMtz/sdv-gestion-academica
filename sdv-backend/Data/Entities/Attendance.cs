using sdv_backend.Domain.Enum;

namespace sdv_backend.Data.Entities
{
    public class Attendance
    {
        public int Id { get; set; }

        public int ClassScheduleId { get; set; }
        public ClassSchedule ClassSchedule { get; set; } = null!;

        public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; } = null!;

        public DateTime Date { get; set; }       // solo fecha, puedes normalizarla a .Date
        public AttendanceStatus Status { get; set; }
    }

    public enum AttendanceStatus
    {
        S = 1,   // Sí asistió
        N = 2,   // No asistió
        J = 3    // Justificado
    }
}
