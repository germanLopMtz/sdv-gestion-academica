using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.OutPutDTO
{
    public class AsistenciaOutPutDTO
    {
        public int Id { get; set; }
        public int ClassScheduleId { get; set; }          // Referencia al horario de clase
        public string Curso { get; set; } = string.Empty;  // Curso al que corresponde la clase
        public string Aula { get; set; } = string.Empty;   // Aula donde se da la clase
        public DateTime Fecha { get; set; }               // Fecha de la clase
        public string Docente { get; set; } = string.Empty; // Nombre del docente

        // Asistencia por alumno (se puede agregar más detalles)
        public List<StudentAttendanceDTO> Alumnos { get; set; } = new List<StudentAttendanceDTO>();
    }

    public class StudentAttendanceDTO
    {
        public int AlumnoId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Asistencia { get; set; } = string.Empty;  // "S", "N", "J", or null
    }
}
