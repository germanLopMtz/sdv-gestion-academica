using System.Text.Json.Serialization;
using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class AsistenciaDTO
    {
        [JsonRequired]
        public int ClassScheduleId { get; set; }

        [JsonRequired]
        public DateTime Fecha { get; set; }

        public List<AlumnoAsistenciaDTO> Asistencias { get; set; } = new List<AlumnoAsistenciaDTO>();
    }

    public class AlumnoAsistenciaDTO
    {
        [JsonRequired]
        public int AlumnoId { get; set; }

        [JsonRequired]
        public AttendanceStatus Status { get; set; }
    }
}
